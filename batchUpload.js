import axios from "axios";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import FormData from "form-data";
dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

const nftFolder = "./nfts";
const outputFolder = "./metadata";

if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

// 🧾 Upload a single file to Pinata
async function uploadFileToPinata(filePath) {
  const fileName = path.basename(filePath);
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
      maxBodyLength: Infinity,
      headers: PINATA_JWT
        ? { Authorization: `Bearer ${PINATA_JWT}`, ...data.getHeaders() }
        : {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
            ...data.getHeaders(),
          },
    });
    console.log(`✅ Uploaded: ${fileName}`);
    return `ipfs://${res.data.IpfsHash}`;
  } catch (err) {
    console.error(`❌ Error uploading ${fileName}:`, err.response?.data || err.message);
  }
}

// 🧠 Auto-format file names like "ghost_wave_01" → "Ghost Wave 01"
function formatName(fileBase) {
  return fileBase
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(".png", "");
}

// 🧬 Create metadata for each NFT
function createMetadata(name, description, imageCID) {
  return {
    name,
    description,
    image: imageCID,
    attributes: [
      { trait_type: "Collection", value: "Ghost Signal" },
      { trait_type: "Artist", value: "Cipher" },
      { trait_type: "Drop", value: "Genesis 50" },
    ],
  };
}

// 🚀 Main Batch Process
async function batchUpload() {
  const files = fs.readdirSync(nftFolder).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  console.log(`Found ${files.length} NFTs to upload...\n`);

  for (const file of files) {
    const filePath = path.join(nftFolder, file);
    const baseName = path.parse(file).name;
    const formattedName = formatName(baseName);

    // Step 1: Upload image
    const imageCID = await uploadFileToPinata(filePath);
    if (!imageCID) continue;

    // Step 2: Create metadata
    const metadata = createMetadata(formattedName, `Ghost Signal NFT — ${formattedName}`, imageCID);
    const metadataPath = path.join(outputFolder, `${baseName}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`🧾 Metadata saved: ${metadataPath}`);

    // Step 3: Upload metadata JSON
    const metadataCID = await uploadFileToPinata(metadataPath);
    console.log(`🌐 Metadata uploaded: ${metadataCID}\n`);
  }

  console.log("✅ All NFTs processed and pinned!");
}

batchUpload();
