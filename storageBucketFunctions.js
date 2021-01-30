async function uploadFile(storage, bucketName, fileName) {
    // Uploads a local file to the bucket
    await storage.bucket(bucketName).upload(fileName, {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      // By setting the option `destination`, you can change the name of the
      // object you are uploading to a bucket.
      metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        cacheControl: 'public, max-age=31536000',
      },
    });

    console.log(`${fileName} uploaded to ${bucketName}.`);
  }

  async function downloadFile() {
    const options = {
      // The path to which the file should be downloaded, e.g. "./file.txt"
      destination: destFilename,
    };

    // Downloads the file
    await storage.bucket(bucketName).file(srcFilename).download(options);

    console.log(
      `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
    );
  }

  async function checkIfFileExists(storage, bucketName, fileName) {
    // Lists files in the bucket
    const [files] = await storage.bucket(bucketName).getFiles();

    for (const file of files) {
      if(file.name === `${fileName}.kml`) {
        return true;
      }
    };
    return false;
  }

  async function deleteFile(storage, bucketName,filename) {
    // Deletes the file from the bucket
    await storage.bucket(bucketName).file(filename).delete();

    console.log(`gs://${bucketName}/${filename} deleted.`);
  }

module.exports = { uploadFile, downloadFile, deleteFile, checkIfFileExists }