const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const getRandomNamePrepend = () => {
    let ran = Math.floor(Math.random() * 10000)
    return Math.floor(Math.random() * Math.floor(ran));
}

exports.imageFilter = imageFilter;
exports.getRandomNamePrepend = getRandomNamePrepend;
