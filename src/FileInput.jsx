import midjourney from './assets/midjourney.svg'
import "./fileInput.css";

// eslint-disable-next-line react/prop-types
const FileInput = ({onFileUpload}) => {
  return (

          <div className="file1-upload-parent">
            <div className="file-upload">
              <img src={midjourney} alt="upload" width='100px' height='100px'/>
              <h3>Click box to upload</h3>
              <p>Maximun file size 10mb</p>
              <input type="file" accept="image/*" multiple onChange={onFileUpload}/>
            </div>
          </div>

  )
}

export default FileInput