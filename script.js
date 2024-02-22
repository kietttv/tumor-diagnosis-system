
const CLASSES = {
    0: 'Golioma',
    1: 'Meningima',
    2: 'No tumor',
    3: 'Pituitary'
};

// Load model
$("document").ready(async function () {
    $('#loading-screen').show();
    model = await tf.loadLayersModel('tenserflowjs/model.json');
    console.log('Load model');
    console.log(model.summary());
    $('#loading-screen').hide();
});

$("#upload_button").click(function () {
    $("#fileinput").trigger('click');
});

async function predict() {
    $('#loading-screen').show();
    
    // 1. Convert image to tensor
    let image = document.getElementById("display_image");
    let img = tf.browser.fromPixels(image);
    let tensor = img
        .resizeNearestNeighbor([512, 512]) // Adjust the image size to 512x512 pixels
        .toFloat() // Converts pixel values to float numbers
        .div(255.0) // Normalize pixel values in the range from 0 to 1
        .expandDims(); // Expand the dimension of the tensor to form a 4D tensor

    // 2. Predict
    let predictions = await model.predict(tensor);
    predictions = predictions.dataSync();
    console.log(predictions);

    // Chat GPT code
    // let predictions = await model.predict(tensor); 
    // let predictionsArray = Array.from(predictions.dataSync()); 
    // console.log(predictionsArray);

    $('#loading-screen').hide();

    // 3. Display 
    let top = Array.from(predictions)
        .map(function (p, i) {
            return {
                probability: p,
                className: CLASSES[i]
            };
        }).sort(function (a, b) {
            return b.probability - a.probability;
        });
    console.log(top);
    $("#result_info").empty();
    top.forEach(function (p) {
        $("#result_info").append(`<li>${p.className}: ${p.probability.toFixed(3)}</li>`);
    });
};

$("#fileinput").change(function () {
    $('#loading-screen').show();
    let reader = new FileReader();
    reader.onload = function () {
        let dataURL = reader.result;

        imEl = document.getElementById("display_image");
        imEl.onload = function () {
            $('#loading-screen').hide(); 
            predict();
        }
        $("#display_image").attr("src", dataURL);
        $("#result_info").empty();
    }
    let file = $("#fileinput").prop("files")[0];
    reader.readAsDataURL(file);
});
