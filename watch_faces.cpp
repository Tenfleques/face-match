#include <stdio.h>
#include <stdlib.h>
#include <sstream> 
#include <fstream>

#include <errno.h>
#include <exception>

#include <sys/types.h>
#include <sys/inotify.h>

#include <dlib/dir_nav.h>
#include <dlib/dnn.h>
#include <dlib/image_io.h>
#include <dlib/misc_api.h>

using namespace dlib;
using namespace std;

#define EVENT_SIZE  ( sizeof (struct inotify_event) )
#define BUF_LEN     ( 1024 *( EVENT_SIZE + 16 ) )

// ResNet network - replaced the loss
// layer with loss_metric and make the network somewhat smaller.

template <template <int,template<typename>class,int,typename> class block, int N, template<typename>class BN, typename SUBNET>
using residual = add_prev1<block<N,BN,1,tag1<SUBNET>>>;

template <template <int,template<typename>class,int,typename> class block, int N, template<typename>class BN, typename SUBNET>
using residual_down = add_prev2<avg_pool<2,2,2,2,skip1<tag2<block<N,BN,2,tag1<SUBNET>>>>>>;

template <int N, template <typename> class BN, int stride, typename SUBNET> 
using block  = BN<con<N,3,3,1,1,relu<BN<con<N,3,3,stride,stride,SUBNET>>>>>;


template <int N, typename SUBNET> using res       = relu<residual<block,N,bn_con,SUBNET>>;
template <int N, typename SUBNET> using ares      = relu<residual<block,N,affine,SUBNET>>;
template <int N, typename SUBNET> using res_down  = relu<residual_down<block,N,bn_con,SUBNET>>;
template <int N, typename SUBNET> using ares_down = relu<residual_down<block,N,affine,SUBNET>>;

// ----------------------------------------------------------------------------------------

template <typename SUBNET> using level0 = res_down<256,SUBNET>;
template <typename SUBNET> using level1 = res<256,res<256,res_down<256,SUBNET>>>;
template <typename SUBNET> using level2 = res<128,res<128,res_down<128,SUBNET>>>;
template <typename SUBNET> using level3 = res<64,res<64,res<64,res_down<64,SUBNET>>>>;
template <typename SUBNET> using level4 = res<32,res<32,res<32,SUBNET>>>;

template <typename SUBNET> using alevel0 = ares_down<256,SUBNET>;
template <typename SUBNET> using alevel1 = ares<256,ares<256,ares_down<256,SUBNET>>>;
template <typename SUBNET> using alevel2 = ares<128,ares<128,ares_down<128,SUBNET>>>;
template <typename SUBNET> using alevel3 = ares<64,ares<64,ares<64,ares_down<64,SUBNET>>>>;
template <typename SUBNET> using alevel4 = ares<32,ares<32,ares<32,SUBNET>>>;

// network type
using net_type = loss_metric<fc_no_bias<128,avg_pool_everything<
                            alevel0<
                            alevel1<
                            alevel2<
                            alevel3<
                            alevel4<
                            max_pool<3,3,2,2,relu<affine<con<32,7,7,2,2,
                            input_rgb_image
                            >>>>>>>>>>>>;

// ----------------------------------------------------------------------------------------
bool hasEnding (std::string const &fullString, std::string const &ending) {
    if (fullString.length() >= ending.length()) {
        return (0 == fullString.compare (fullString.length() - ending.length(), ending.length(), ending));
    } else {
        return false;
    }
}

void load_objects (
    const std::string dir,
    std::vector<matrix<rgb_pixel>>& images,
    std::vector<std::string>& labels ){

    images.clear();
    labels.clear();

    matrix<rgb_pixel> image;

     
    for (auto img : directory(dir).get_files()){
        if(hasEnding (img, ".png")){
            load_image(image, img);
            images.push_back(std::move(image));
            labels.push_back(img);     
        } 
    }
}
std::string getFilename (const std::string& str){
    std::size_t found = str.find_last_of("/\\");
    return str.substr(found+1);
}

std::string compareFaces(std::vector<dlib::matrix<float,0,1>> embedded_wild, 
    std::vector<dlib::matrix<float,0,1>> embedded_target,
    std::vector<std::string> target_labels,
    std::vector<std::string> wild_labels,
    float threshold){

    std::stringstream ss;
    
    for (size_t i = 0; i < embedded_target.size(); ++i){
        for (size_t j = 0; j < embedded_wild.size(); ++j){
            float distance = length(embedded_target[i]-embedded_wild[j]);
            //if(distance < threshold){
                // take the box information from the wild image name
                ss << "{ \"distance\": " << distance
                << ", \"known\": \"" << getFilename(target_labels[i]) << "\""
                << ", \"unknown\": \"" << getFilename(wild_labels[j]) << "\""
                << "},";
            //}            
        }
    }
    return ss.str();
}

int processImageWithDir(dlib::file img, 
    std::string dir, 
    std::string output_file,
    net_type & net,
    bool compare_with_wild_directory = true
    ){

    std::vector<matrix<rgb_pixel>> wild_images;
    std::vector<string> wild_labels;

    std::vector<matrix<rgb_pixel>> target_images;
    std::vector<string> target_labels;

    dlib::matrix<dlib::rgb_pixel> image_content;

    if (compare_with_wild_directory){
        // collect all faces in wild to compare with img
        load_objects(dir, wild_images, wild_labels);
        load_image(image_content, img);
        target_images.push_back(std::move(image_content));
        target_labels.push_back(img); 

    }else{
        // collect all faces in target to compare with img
        load_objects(dir, target_images, target_labels);
        load_image(image_content, img);
        wild_images.push_back(std::move(image_content));
        wild_labels.push_back(img); 
    }

    if (target_labels.empty() || wild_labels.empty()){
        return -1;
    }
    // Run all the images through the network to get their vector embeddings.
    std::vector<matrix<float,0,1>> embedded_wild = net(wild_images);
    std::vector<matrix<float,0,1>> embedded_target = net(target_images);

    std::string results = compareFaces(embedded_wild, 
        embedded_target, target_labels, 
        wild_labels, 
        net.loss_details().get_distance_threshold());


    std::ofstream outfile;
    outfile.open(output_file, ios::out | ios::app);
    outfile << results;
    outfile.close();

    return 0;
}

int main( int argc, char **argv ) {
    /*
        require 3 args 
        1. directory to watch 
        2. output file
        3. weights file

    */
    int length, i = 0;
    int fd;
    int wd_0, wd_1;
    char buffer[BUF_LEN];

    std::string directory_to_watch = "../images/faces", 
    output_file = "../rest/metrics/overall.json", 
    weights_file = "weights/metric_network_renset.dat";

    std::string target_dir  = directory_to_watch + "/target/";
    std::string wild_dir  = directory_to_watch + "/wild/";

    printf("watching %s \n", target_dir.c_str());
    printf("watching %s \n", wild_dir.c_str());

    fd = inotify_init();

    if ( fd < 0 ) {
        perror( "inotify_init" );
    }

    wd_0 = inotify_add_watch( fd, target_dir.c_str(), IN_CREATE );
    wd_1 = inotify_add_watch( fd, wild_dir.c_str(), IN_CREATE );

    length = read( fd, buffer, BUF_LEN );  

    if ( length < 0 ) {
        perror( "read" );
    }  
    net_type net;
    deserialize(weights_file) >> net;

    while ( true ) {
        struct inotify_event *event = ( struct inotify_event * ) &buffer[ i ];
        if ( event->len ) {
            if ( event->mask & IN_CREATE ) {

                if ( event->mask & IN_ISDIR ) {
                    continue;        
                }
                
                std::string str_name = event->name;
                if ( hasEnding (str_name, ".png") ) {
                    // run the model
                    std::string event_fullname;
                    std::string dir;
                    bool compare_with_wild_directory;

                    if(event->wd == wd_0){
                        // new file in target directory 
                        event_fullname = target_dir + std::string(event->name);
                        dir = wild_dir;
                        compare_with_wild_directory = true;
                    }else if(event->wd == wd_1) {
                        // new file in wild directory 
                        event_fullname = wild_dir + std::string(event->name);
                        dir = target_dir;
                        compare_with_wild_directory = false;
                    }else{
                        continue;
                    }
                    dlib::file img = dlib::file(event_fullname.c_str());

                    try{
                        int fin = processImageWithDir(img, dir, output_file, net, compare_with_wild_directory);
                    
                        printf("%s %d\n", event->name, fin);
                    }catch (const std::exception & ex){
                        std::cout << ex.what() << endl;
                        continue;
                    }
                }
            }
        }  
        length = read( fd, buffer, BUF_LEN );      
    }

    ( void ) inotify_rm_watch( fd, wd_0 );
    ( void ) inotify_rm_watch( fd, wd_1 );
    ( void ) close( fd );

    exit( 0 );
}