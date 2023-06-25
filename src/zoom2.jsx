/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import "./App.css";
import FileInput from "./FileInput";
import LoadingBar from "react-top-loading-bar";

function ImageToZoomVideo() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [imageFiles, setImageFiles] = useState([]);
  const [zoomScale, setZoomScale] = useState(2);
  const [zoomDirection, setZoomDirection] = useState("out");
  const [videoLoading, setVideoLoading] = useState(0);
  const [zoomSpeed, setZoomSpeed] = useState('regular');
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const zoomSpeedDict = {
    'slow' : 6,
    'regular' : 3,
    'Fast': 1,
  }

  const handleImageUpload = (event) => {
    console.log(URL.createObjectURL(event.target.files[0]));
    setImageFiles(Array.from(event.target.files));
  };

  const createVideo = async () => {
    console.log("in create video func");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const zoomIn = async (img) => {
      console.log(`in zoom func`);
      return new Promise((resolve) => {
        let scale = 1;
        const zoomFactor = Math.pow(zoomScale, 1 / (zoomSpeedDict[zoomSpeed] * 60));

        const animate = () => {
          console.log(`in animate func`);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / zoomScale;
          const y = (canvas.height - scaledHeight) / zoomScale;

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          scale *= zoomFactor;

          if (scale >= zoomScale) {
            resolve();
          } else {
            requestAnimationFrame(animate);
          }
        };

        animate();
      });
    };

    const zoomOut = async (img) => {
      return new Promise((resolve) => {
        let scale = zoomScale;
        const zoomFactor = Math.pow(1 / zoomScale, 1 / (zoomSpeedDict[zoomSpeed] * 60));

        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / zoomScale;
          const y = (canvas.height - scaledHeight) / zoomScale;

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          scale *= zoomFactor;

          if (scale <= 1) {
            resolve();
          } else {
            requestAnimationFrame(animate);
          }
        };

        animate();
      });
    };

    for (const [i, file] of imageFiles.entries()) {
      setVideoLoading(((i + 1) / imageFiles.length) * 100);
      console.log(`starting image ${i + 1}`);
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = async () => {
          console.log(`object url loaded for image ${i + 1}`);
          if (i == 0) {
            console.log(`setting canvas size for image ${i + 1}`);
            canvas.width = img.width;
            canvas.height = img.height;
            setVideoSize({ width: img.width, height: img.height });
          }
          console.log(`starting zoom for image ${i + 1}`);
          if (zoomDirection === "in") {
            await zoomIn(img);
          } else {
            await zoomOut(img);
          }
          resolve();
        };
      });
    }
    console.log("stopping media recorder");
    mediaRecorderRef.current.stop();
  };

  const startRecording = () => {
    console.log("starting media recorder");
    const canvas = canvasRef.current;
    const stream = canvas.captureStream(120);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = (e) => {
      console.log("on data available");
      chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      console.log("on stop");
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      console.log("setting video src");
      setVideoSrc(URL.createObjectURL(blob));
      chunksRef.current = [];
    };

    mediaRecorderRef.current = recorder;
    mediaRecorderRef.current.start();

    createVideo();
  };

  return (
    <div>
      <LoadingBar
        color="#646cff"
        progress={videoLoading}
        onLoaderFinished={() => setVideoLoading(0)}
        shadow={false}
        height={5}
      />
      <h1>Create zoomed images video</h1>
      <h2>upload images in order</h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* <input type="file" accept="image/*" multiple onChange={handleImageUpload} /> */}
        <FileInput onFileUpload={handleImageUpload} />
        {imageFiles.length > 0 && <h2>{imageFiles.length} images uploaded</h2>}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {imageFiles &&
            imageFiles.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt="Image preview"
                style={{
                  height: "100px",
                  width: "100px",
                  background: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "7px 20px 20px rgb(210, 227, 244)",
                }}
              />
            ))}
        </div>
        <div>
          <button onClick={() => setZoomScale(1.5)}>Zoom 1.5x</button>
          <button onClick={() => setZoomScale(2)}>Zoom 2x</button>
        </div>
        <div>
          <button onClick={() => setZoomDirection("in")}>Zoom In</button>
          <button onClick={() => setZoomDirection("out")}>Zoom Out</button>
        </div>
        <div>
          <button onClick={() => setZoomSpeed('slow')}>slow</button>
          <button onClick={() => setZoomSpeed('regular')}>regular</button>
          <button onClick={() => setZoomSpeed('fast')}>fast</button>
        </div>
        <h2>{zoomScale}x scale zoom {zoomDirection} video in {zoomSpeed} speed</h2>
        <button onClick={startRecording}>Create Video</button>
        {videoLoading > 0 && imageFiles && (
          <h2>Video Loading: {videoLoading}%</h2>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
      {videoSrc && (
        <video
          width={videoSize.width}
          height={videoSize.height}
          src={videoSrc}
          autoPlay
          loop
          controls
        />
      )}
    </div>
  );
}

export default ImageToZoomVideo;
