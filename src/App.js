import './App.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as faceapi from 'face-api.js'
import { db } from './firebase'
import { get, ref } from 'firebase/database'
import mqtt from 'mqtt/dist/mqtt'

var options = {
    host: 'feb95b48d8af492390bc8cfcc6f8d84b.s2.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'Patrick_Admin',
    password: 'Bank@0225'
}


function App() {
  const [faceData, setFaceData] = useState()
  const [faceMatcher, setFaceMatcher] = useState()

  const navigate = useNavigate()
  
  useEffect(() => {
    get(ref(db, 'FaceData'))
    .then(snapshot => {
      setFaceData(snapshot.val())
    })
      
  }, [])

  const loadModels = async () => {
    await faceapi.loadSsdMobilenetv1Model('/models')
    await faceapi.loadFaceLandmarkModel('/models')
    await faceapi.loadFaceRecognitionModel('/models')

    window.alert("Models are loaded!")
    console.log("Models are loaded!")

    const labeledDescriptions = []

    Object.keys(faceData).forEach(key => {
      const newDescriptions = []

      faceData[key].descriptions.map(descrip => newDescriptions.push(new Float32Array(descrip)))

      labeledDescriptions.push(new faceapi.LabeledFaceDescriptors(key, newDescriptions))
    })

    setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptions))

    window.alert("Face Encodings are set!")
  }



  const startDetection = () => {
    const video = document.getElementById('camStream')
    const videoContainer = document.getElementById('container')
    const nameContainer = document.getElementById('face-name')
    
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
            const bestMatch = faceMatcher.findBestMatch(detections.descriptor)
            nameContainer.innerHTML = bestMatch.toString().split(" ")[0]
            const DetectionsArray = faceapi.resizeResults(detections, canvasSize);
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, DetectionsArray)
        }

    }, 100)
  }

  const playStream = () => {
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

  const handleFlashON = () => {
    var client = mqtt.connect(options)
    client.on('connect', () => {
      window.alert("MQTT")
    })
    client.publish('ledStatus', "FLASH_ON")
  }

  const handleFlashOFF = () => {
    var client = mqtt.connect(options)
    client.on('connect', () => {
      window.alert("MQTT")
    })
    client.publish('ledStatus', "FLASH_OFF")
  }


  const addFace = () => {
    navigate('/add')
  }
  

  return (
    <div className="App">
      <div>
        <span className='name'>Recognized Face : </span><span id='face-name' className='face-name'> </span>
      </div>
      <div id="container" className='container'>
        { /*<video autoPlay id="camStream" className="camStream"></video> */ }
        <img crossOrigin='anonymous' src="http://192.168.1.6/stream" className='camStream' id="camStream"/>
      </div>
      <div className='button-container'>
        <button onClick={loadModels} className='button'>Load Tensorflow Models</button>
        <button onClick={playStream} className='button'>Play</button>
        <button onClick={addFace} className="button">Add Face</button>
        <br></br>
        <button onClick={handleFlashON} className="button">Flash ON</button>
        <button onClick={handleFlashOFF} className="button">Flash OFF</button>
      </div>
    </div>
  );
}

export default App;
