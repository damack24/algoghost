import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

// === Choose one local image to test ===
const filePath = "./nfts/digital_specter_01.png";

async function uploadToPinata() {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  const res = await axios.post(url, data, {
    maxBodyLength: Infinity,
    headers: {
      ...data.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
  });

  console.log("✅ Uploaded to Pinata!");
  console.log("CID:", res.data.IpfsHash);
  console.log("Gateway:", `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`);
}

uploadToPinata().catch(console.error);
