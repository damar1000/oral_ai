// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";
import { loadModel } from "./loadModel";

function App() {
  const [imageTag, setImageTag] = useState([]);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isCameraClose, setIsCameraClose] = useState(true);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();

  const triggerCamera = () => {
    setIsCameraClose(!isCameraClose);
    setIsModelReady(!isModelReady);
  };

  const detect = async (screenshot, index) => {
    const list = [...imageTag];
    setImageTag(list);
    
    const model = await loadModel();
    
    const img = tf.browser.fromPixels(screenshot);
    const resized = tf.image.resizeBilinear(img, [640, 480]);
    const casted = resized.cast("int32");
    const expanded = casted.expandDims(0);
    const obj = model.predict(expanded);
    let predicted = obj.argMax(1).dataSync()[0];
    
    if(predicted === 0){
      list[index]["prediction"] = "Aphtous Stomatitis";
      toast.success("Predicted : Aphtous Stomatitis");
    } 
    else if(predicted === 1){
      list[index]["prediction"] = "Gingivitis";
      toast.success("Predicted : Gingivitis");
    }
    else if(predicted === 2){
      list[index]["prediction"] = "Leukoplakia";
      toast.success("Predicted : Leukoplakia");
    }
    else if(predicted === 3){
      list[index]["prediction"] = "Healthy";
      toast.success("Predicted : Healthy");
    }
    else if(predicted === 4){
      list[index]["prediction"] = "Oral Cancer";
      toast.success("Predicted : Oral Cancer");
    }
    else if(predicted === 5){
      list[index]["prediction"] = "Periodontitis";
      toast.success("Predicted : Periodontitis");
    }
    else if(predicted === 6){
      list[index]["prediction"] = "Abrasion";
      toast.success("Predicted : Abrasion");
    }
  };

  const saveImageClick = async () => {
    let imageSrc = webcamRef.current.getScreenshot();
    setImageTag([...imageTag, { dataUrl: imageSrc }]);
    console.log(imageTag);
  };
  const chooseImageClick = (e) => {
    let imageSrc = URL.createObjectURL(e.target.files[0])
    setImageTag([...imageTag, { dataUrl: imageSrc }]);
    console.log(imageTag);
  };
  
  const handleServiceRemove = async (index) => {
    const list = [...imageTag];
    list.splice(index, 1);
    setImageTag(list);
  };

  const predictImage = (imageData, index) => {
    let image = new Image();
    image.src = imageData;
    detect(image, index);
  };

  useEffect(() => {
    // if(!localStorage.getItem('token')){
    //   navigate('/login')
    // }
  }, []);

  return (
    <Navbar>
      <div className="min-h-screen p-4 px-6 scrollbar-thin scrollbar-thumb-base-200 scrollbar-track-zinc-400">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <section className="rounded">
            {isCameraClose ? (
              <div className="flex lg:h-[480px] lg:w-[720px] justify-center items-center w-full">
                <button
                  onClick={triggerCamera}
                  className="btn btn-info btn-outline"
                >
                  Open Camera
                </button>
              </div>
            ) : (
              <>
                <h1 className="ml-12 mb-10 text-xl font-bold">Camera</h1>
                <div className="relative h-[270px] w-[480px] lg:w-[640px] lg:h-[480px] ml-12">
                  {isModelReady ? (
                    <>
                      <Webcam
                        ref={webcamRef}
                        muted={true}
                        screenshotQuality={0.8}
                        className="absolute h-[270px] w-[480px] lg:w-[640px] lg:h-[480px] z-10 rounded-lg"
                      />

                      <canvas
                        ref={canvasRef}
                        className="absolute h-[270px] w-[480px] lg:w-[640px] lg:h-[480px] z-20"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex lg:h-[480px] lg:w-[720px] justify-center items-center w-full">
                        <BeatLoader color="#00BFFF" />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </section>
          <div className="flex flex-col pl-10 mt-4 gap-4">
            <div className="flex gap-3">
              <button
                onClick={saveImageClick}
                className="btn btn-primary btn-outline"
              >
                Capture
              </button>
              <input type="file" id="actual-btn"hidden={true} onChange={chooseImageClick}/>
              <label for="actual-btn" className="btn btn-secondary btn-outline">Upload</label>
              {/*<button
                onClick={saveImageClick}
                className="btn btn-secondary btn-outline"
              >
                Upload
                  </button>*/}
            </div>
            <p className="text-lg font-semibold">Images History</p>
            <div className="card bg-base-200 h-[500px] w-[480px] mr-12 p-4 overflow-y-scroll scrollbar-none">
              {imageTag.length > 0 ? (
                imageTag.map((item, index) => (
                  <div className="flex" key={index}>
                    <a
                      href={item.dataUrl}
                      download={`${new Date().getTime()}.jpg`}
                    >
                      <img
                        src={item.dataUrl}
                        ref={imageRef}
                        width={300}
                        alt="images"
                        className="rounded mt-4"
                      />
                    </a>
                    <div className="flex flex-col items-center justify-center p-3 ml-1 gap-3 text-center">
                      <button
                        className="btn btn-primary btn-outline"
                        onClick={() => predictImage(item.dataUrl, index)}
                      >
                        Predict
                      </button>
                      <h1>{item.prediction}</h1>
                      <button className="btn btn-error btn-outline" onClick={() => handleServiceRemove(index)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-lg font-semibold">No Images</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}

export default App;
