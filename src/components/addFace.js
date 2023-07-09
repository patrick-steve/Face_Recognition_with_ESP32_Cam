import { useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import { db } from '../firebase'
import { get, ref, set } from 'firebase/database'

const AddFace = () => {
    const [descriptor, setDescriptor] = useState()
    const nameRef = useRef()

    
    const handleAdd = async () => {
        if(nameRef.current.value !== "") {
            const newData = []
            let prevData;
            await get(ref(db, `FaceData/${nameRef.current.value}`))
                .then(snapshot => {
                    prevData = snapshot.val()
                })

            if(prevData) prevData.descriptions.forEach(dat => newData.push(dat))
            newData.push(descriptor)
            
            const newDataObj = {
                "descriptions": newData
            }
            
            console.log(newDataObj)
            
            await set(ref(db, `FaceData/${nameRef.current.value}`), newDataObj)
                .then(() => {
                    window.alert("Face Has been added successfully!")
                })
        }
        else { window.alert("Please enter a name !") }     
        
    }
    const loadModels = async () => {
        await faceapi.loadSsdMobilenetv1Model('/models')
        await faceapi.loadFaceLandmarkModel('/models')
        await faceapi.loadFaceRecognitionModel('/models')
    
        window.alert("Models are loaded!")
        console.log("Models are loaded!")
    }
    

    const startDetection = () => {
        const video = document.getElementById('camStream')
        const videoContainer = document.getElementById('container')
        
        const canvas = faceapi.createCanvas(video);
        canvas.willReadFrequently = true;
        canvas.setAttribute('id', 'canvas')
        videoContainer.appendChild(canvas)
    
        console.log(video.width)
        const canvasSize = { width: 640, height: 480};
        faceapi.matchDimensions(canvas, canvasSize);
    
    
        setInterval(async () => {
            const detections = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptor()
            if(detections) 
            {
                if(detections) setDescriptor(detections.descriptor)
                
                const DetectionsArray = faceapi.resizeResults(detections, canvasSize);
                canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, DetectionsArray)
            }
    
        }, 100)
    }
    const playStream = () => {
        const videoObj = document.getElementById('camStream')
        videoObj.play()
      }
    
      const playWebcamStream = () => {
        const videoObj = document.getElementById('camStream')
    
        if(navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoObj.srcObject = stream
                console.log("Camera Stream initiated!")
                startDetection()
            })
            .catch(function (err0r) {
              console.log(err0r)
              console.log("Something went wrong!");
            })
        }
      }

    return (
        <div>
            <div className='container' id='container'>
                <video autoPlay id="camStream" className='camStream'></video>
            </div>
            <div className='button-container' style={{ left: '450px', top: '640px' }}>
                <button className='button' onClick={loadModels}>Load Tensorflow Models</button>
                <button className='button' onClick={playStream}>Play</button>
            </div>
            <div className='input-container'>
                <input className='input' type="text" ref={nameRef} placeholder='Type Your Name'/>
                <button className='button' onClick={handleAdd}>Add Face </button>
            </div>
        </div>
    )
}

export default AddFace