
let globalConstant = 'Hari Bol';


// Example function to update the global constant
function updateGlobalConstant(newValue) {
  globalConstant = newValue;
}

document.getElementById('parseButton').addEventListener('click', () => {
  const input = document.getElementById('jsonInput').value;
  try {
    const parsed = JSON.parse(input);
    const jsonObject = JSON.parse(input);
    const requestObject = jsonObject.request;
    updateGlobalConstant(requestObject);
    document.getElementById('output').textContent = JSON.stringify(parsed, null, 2);
  } catch (error) {
    document.getElementById('output').textContent = 'Invalid JSON: ' + error.message;
  }
});

document.getElementById('extractButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('p12FileInput');
  const passwordInput = document.getElementById('p12PasswordInput');
  const output = document.getElementById('p12Output');

  if (fileInput.files.length === 0) {
    output.textContent = 'Please select a .p12 file.';
    return;
  }

  const file = fileInput.files[0];
  const password = passwordInput.value;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const binaryString = arrayBufferToString(arrayBuffer);
    const asn1 = forge.asn1.fromDer(binaryString);
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, password);

    const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const keyBag = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
    const privateKey = forge.pki.privateKeyToPem(keyBag.key);

    output.textContent = formatPrivateKey(privateKey);
  } catch (error) {
    output.textContent = 'Error extracting private key: ' + error.message;
  }
});

// Helper function to convert ArrayBuffer to a binary string
function arrayBufferToString(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

document.getElementById('signButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('p12FileInput');
  const password = document.getElementById('p12PasswordInput').value;

  try {
    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const privateKey = await extractPrivateKey(arrayBuffer, password);

    if (privateKey) {
      const requestString = JSON.stringify(globalConstant);
      //const requestString = JSON.stringify(requestObject);
      alert(privateKey.textContent);
      const signature = signRequest(requestString, privateKey);

      document.getElementById('signatureOutput').textContent = "Signature:\n" + signature;
    } else {
      throw new Error('Failed to extract private key.');
    }
  } catch (error) {
    document.getElementById('signatureOutput').textContent = 'Error: ' + error.message;
  }
});

async function extractPrivateKey(p12ArrayBuffer, password) {
  try {
    const p12Der = forge.util.createBuffer(p12ArrayBuffer);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const keyBag = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
    const privateKey = keyBag.key;

    return privateKey;
  } catch (error) {
    throw new Error('Failed to extract private key: ' + error.message);
  }
}

function signRequest(data, privateKey) {
  const md = forge.md.sha256.create();
  md.update(data, 'utf8');
  const signature = privateKey.sign(md);
  return forge.util.encode64(signature);
}

function formatPrivateKey(privateKey) {
  // Split by lines
  const lines = privateKey.trim().split('\n');
  // Remove first and last lines
  const trimmedLines = lines.slice(1, -1);
  // Join remaining lines into a single string
  const formattedPrivateKey = trimmedLines.join('');
  return formattedPrivateKey;
}

