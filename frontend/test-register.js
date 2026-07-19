import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testRegister() {
  try {
    const form = new FormData();
    form.append("fullname", "Test User");
    form.append("username", `testuser_${Date.now()}`);
    form.append("email", `test_${Date.now()}@example.com`);
    form.append("password", "password123");
    
    // We need a dummy image file. Let's create one.
    const dummyPath = path.join(__dirname, "dummy.jpg");
    fs.writeFileSync(dummyPath, "dummy image content");
    form.append("avatar", fs.createReadStream(dummyPath));

    console.log("Sending request to http://localhost:8000/api/v1/users/register...");
    const res = await axios.post("http://localhost:8000/api/v1/users/register", form, {
      headers: form.getHeaders()
    });
    console.log("Success! Status:", res.status);
    console.log("Response:", res.data);
    fs.unlinkSync(dummyPath);
  } catch (error) {
    console.error("Error occurred:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
    // Clean up
    if (fs.existsSync(path.join(__dirname, "dummy.jpg"))) {
      fs.unlinkSync(path.join(__dirname, "dummy.jpg"));
    }
  }
}

testRegister();
