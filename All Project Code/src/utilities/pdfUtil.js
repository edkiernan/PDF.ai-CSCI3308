
// const pdfjsLib = require('pdfjs-dist');

const { downloadPDF } = require('./storageHandler.js');



async function getTextFromPage(pdfBuffer, pageNumber) {
    const pdfjsLib = await import('pdfjs-dist');
    try {
        pageNumber = parseInt(pageNumber);
        // Download the file into a buffer.
        // const [pdfBuffer] = await downloadPDF(fileName, username);

        // Convert the buffer into a Uint8Array.
        const uint8Array = new Uint8Array(pdfBuffer);

        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdfDocument = await loadingTask.promise;

        // console.log(`file: {fileName}, numPages: ${pdfDocument.numPages}, getPage ${pageNumber}`)

        const page = await pdfDocument.getPage(pageNumber);

        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => item.str).join(' ');

        // Output the text of the desired page
        // console.log(`Text from page ${pageNumber}:`);
        // console.log(textItems);
        return textItems;

    } catch (error) {
        console.error('Error during PDF text extraction:', error);
    }
}

async function getMaxNumPages(pdfBuffer, pageNumber) {
    const pdfjsLib = await import('pdfjs-dist');
    try {
        pageNumber = parseInt(pageNumber);
        // Download the file into a buffer.

        // Convert the buffer into a Uint8Array.
        const uint8Array = new Uint8Array(pdfBuffer);

        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdfDocument = await loadingTask.promise;
    
       // returns the total/maximum number of pages of the uploaded PDF 
       return pdfDocument.numPages;

    } catch (error) {
        console.error('Error during PDF upload', error);
    }
}

module.exports = {
    getTextFromPage,
    getMaxNumPages
}