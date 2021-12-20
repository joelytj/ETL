import express from "express";
import pinataSDK from "@pinata/sdk";
import fs from "fs";
import cors from "cors";
import multer from "multer";
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

const { portX, pinataApiKey, pinataSecretKey } = require('../config.cjs');

const app = express();
const upload = multer({ dest: "uploads/" });
const port = process.env.NODE_ENV === "production" ? portX : 8080; // default port to listen
let pinata = pinataSDK(pinataApiKey, pinataSecretKey );

const corsOptions = {
  origin: ["http://localhost:3030", "http://34.200.118.178:3030", "https://www.ether-learn.com"],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

// defines a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello developers!");
});

// handles minting
app.post("/mint", upload.single("image"), async (req, res) => {
  const multerReq = req;
   
  const fileName = multerReq.file.filename;
  // tests Pinata authentication
  await pinata
    .testAuthentication()
    .catch((err) => res.status(500).json(JSON.stringify(err)));
  // creates readable stream
  const readableStreamForFile = fs.createReadStream(`./uploads/${fileName}`);
  
  
  const options = JSON.stringify({
    pinataMetadata: {
      name: "image.png"
    }
  });
  const pinnedFile = await pinata.pinFileToIPFS(
    readableStreamForFile,
    options
  );  
  try {  
    if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0) {
      // remove file from server
      fs.unlinkSync(`./uploads/${fileName}`);
      // pins metadata
      const metadata = {
        name: `Etherlearn NFT Token`,
        description: `Etherlearn NFT Token for 4 or 5 star rating`,
        image: `https://gateway.pinata.cloud/ipfs/${pinnedFile.IpfsHash}`,
        creator: req.body.creator,
      };

      const options = JSON.stringify({
        pinataMetadata: {
          name: "metadata.json"
        }
      });
      const pinnedMetadata = await pinata.pinJSONToIPFS(metadata, options);


      if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize > 0) {
        res.status(200).json({
          status: true,
          msg: {
            imageHash: pinnedFile.IpfsHash,
            metadataHash: pinnedMetadata.IpfsHash
          }
        });
      } else {
        res
          .status(500)
          .json({ status: false, msg: "metadata were not pinned" });
      }
    }
  }
  catch {
    res.status(500).json({ status: false, msg: pinnedFile.IpfsHash});
  }
});


// starts the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

app.listen.keepAliveTimeout = 65000;