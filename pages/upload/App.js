import { useState } from 'react'
import axios from 'axios'

import './App.css'

async function postImage({image, address}) {
  const formData = new FormData();
  formData.append("image", image)
  formData.append("address", address)

  const result = await axios.post('/images', formData, { headers: {'Content-Type': 'multipart/form-data'}})
  return result.data
}


function App() {

  const [file, setFile] = useState()
  const [address, setAddress] = useState("")
  const [images, setImages] = useState([])

  const submit = async event => {
    event.preventDefault()
    const result = await postImage({image: file, address})
    setImages([result.image, ...images])
  }

  const fileSelected = event => {
    const file = event.target.files[0]
		setFile(file)
	}

  return (
    <div className="App">
      <form onSubmit={submit}>
        <input onChange={fileSelected} type="file" accept="image/*"></input>
        <input value={address} placeholder="Account Address 0x.." onChange={e => setAddress(e.target.value)} type="text"></input>
        <button type="submit">Submit</button>
      </form>

    </div>
  );
}

export default App;
