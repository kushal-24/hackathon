import multer from "multer";

const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        //req- user se json data aatai in parsed form  but cant configure files
        //file data cant come through json which is why we have FILES to recieve file uploads
        //cb-callback
      cb(null, "./public/temp")//keeping the file at this path
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
       //to save file by its originalname
    }
  })
  
export const upload = multer({ 
    storage, 
})
