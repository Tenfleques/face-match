cmake_minimum_required(VERSION 2.8.12)
# Every project needs a name.  We call this the "tests" project.
project(test)


# Tell cmake we will need dlib.  This command will pull in dlib and compile it
# into your project.  Note that you don't need to compile or install dlib.  All
# cmake needs is the dlib source code folder and it will take care of everything.
add_subdirectory(../dlib dlib_build)

# If you have cmake 3.14 or newer you can even use FetchContent instead of
# add_subdirectory() to pull in dlib as a dependency.  So instead of using the
# above add_subdirectory() command, you could use the following three commands
# to make dlib available:
#  include(FetchContent)
#  FetchContent_Declare(dlib
#      GIT_REPOSITORY https://github.com/davisking/dlib.git
#      GIT_TAG        v19.18
#  )
#  FetchContent_MakeAvailable(dlib)


# To compile this program all you need to do is ask cmake.  You would type
# these commands from within the directory containing this CMakeLists.txt
# file:
#   mkdir build
#   cd build
#   cmake ..
#   cmake --build . --config Release
#
# The cmake .. command looks in the parent folder for a file named
# CMakeLists.txt, reads it, and sets up everything needed to build program.
# Also, note that CMake can generate Visual Studio or XCode project files.  So
# if instead you had written:
#   cd build
#   cmake .. -G Xcode
#
# You would be able to open the resulting Xcode project and compile and edit
# the test programs within the Xcode IDE.  CMake can generate a lot of
# different types of IDE projects.  Run the cmake -h command to see a list of
# arguments to -G to see what kinds of projects cmake can generate for you.  It
# probably includes your favorite IDE in the list.




#################################################################################
#################################################################################
#  A CMakeLists.txt file can compile more than just one program.  So below we
#  tell it to compile the other dlib test programs using pretty much the
#  same CMake commands we used above.
#################################################################################
#################################################################################


# Since there will be a lot of tests I'm going to use a macro to simplify this
# CMakeLists.txt file.  However, usually you will create only one executable in
# your cmake projects and use the syntax shown above.
macro(add_test name)
   add_executable(${name} ${name}.cpp)
   target_link_libraries(${name} dlib::dlib )
endmacro()

# if an test requires GUI, call this macro to check DLIB_NO_GUI_SUPPORT to include or exclude
macro(add_gui_test name)
   if (DLIB_NO_GUI_SUPPORT)
      message("No GUI support, so we won't build the ${name} test.")
   else()
      add_test(${name})
   endif()
endmacro()

# here we apply our macros 
add_test(watch_faces)
add_test(dnn_mloi_train)

if (DLIB_LINK_WITH_SQLITE3)
   add_test(sqlite_ex)
endif()


