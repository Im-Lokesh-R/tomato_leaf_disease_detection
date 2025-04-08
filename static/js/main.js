$(document).ready(function () {
    // Init
    $('.image-section').hide();
    $('.loader').hide();
    $('#result').hide();

    // Upload Preview
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').css({
                    'background-image': 'url(' + e.target.result + ')',
                    'background-size': 'contain',
                    'background-repeat': 'no-repeat',
                    'background-position': 'center',
                    'height': '220px',
                    'width': '100%'
                });
                $('.image-section').show();
                $('#btn-predict').show();
                $('#capture-btn').hide();
                $('#video').hide();
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#imageUpload").change(function () {
        if (this.files.length > 0) {
            readURL(this);
            $('#result').text('');
            $('#result').hide();
        }
    });

    // Camera Functionality
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    $('#camera-btn').click(function () {
        $('.image-section').show();
        $('#video').show();
        $('#capture-btn').show();
        $('#btn-predict').hide();
        $('#imagePreview').css('background-image', 'none');
        $('#result').text('');
        $('#result').hide();

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => {
                console.error("Error accessing camera: ", err);
                alert("Oops! Couldn’t access your camera. Please allow permission or use the upload option.");
                $('#video').hide();
                $('#capture-btn').hide();
                $('.image-section').hide();
            });
    });

    $('#capture-btn').click(function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');

        $('#imagePreview').css({
            'background-image': 'url(' + imageData + ')',
            'background-size': 'contain',
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'height': '220px',
            'width': '100%'
        });
        $('#video').hide();
        $('#capture-btn').hide();
        $('#btn-predict').show();

        // Stop the camera stream
        const stream = video.srcObject;
        stream.getTracks().forEach(track => track.stop());
    });

    // Predict
    $('#btn-predict').click(function () {
        let formData = new FormData();
        if ($('#imageUpload')[0].files.length > 0) {
            formData.append('file', $('#imageUpload')[0].files[0]);
        } else {
            canvas.toBlob(blob => {
                formData.append('file', blob, 'captured_image.jpg');
                sendPrediction(formData);
            }, 'image/jpeg');
            return;
        }
        sendPrediction(formData);
    });

    function sendPrediction(formData) {
        $('#btn-predict').hide();
        $('.loader').show();

        $.ajax({
            type: 'POST',
            url: '/predict',
            data: formData,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                $('.loader').hide();
                $('#result').fadeIn(600);
                $('#result').text('Prediction: ' + data);
                console.log('Success!');
            },
            error: function () {
                $('.loader').hide();
                $('#result').fadeIn(600);
                $('#result').text('Error: Could not process the image.');
            }
        });
    }

    // Disease Modal Content (unchanged from previous practical info version)
    $('.disease-card').click(function () {
        var disease = $(this).parent().data('disease');
        var content = '';

        switch (disease) {
            case 'bacterial-spot':
                content = `
                    <h5>Bacterial Spot</h5>
                    <p><strong>Symptoms:</strong> Small, water-soaked spots on leaves that turn dark brown or black with yellow halos; fruit may have raised, scabby spots.</p>
                    <p><strong>Impact:</strong> Reduces yield and fruit quality; severe cases cause leaf drop.</p>
                    <p><strong>Prevention:</strong> Use disease-free seeds, avoid overhead watering, rotate crops every 2-3 years.</p>
                    <p><strong>Treatment:</strong> Apply copper-based sprays early; remove and destroy infected plants.</p>
                    <p><strong>Learn More:</strong> <a href="https://www.extension.umn.edu/garden/yard-garden/diseases/bacterial-spot-tomato" target="_blank">University of Minnesota Extension</a></p>
                `;
                break;
            case 'early-blight':
                content = `
                    <h5>Early Blight</h5>
                    <p><strong>Symptoms:</strong> Dark brown spots with concentric rings ("target spots") on older leaves; yellowing around spots.</p>
                    <p><strong>Impact:</strong> Weakens plants, reduces fruit size and yield.</p>
                    <p><strong>Prevention:</strong> Stake or cage plants for air circulation, mulch soil, avoid working with wet plants.</p>
                    <p><strong>Treatment:</strong> Apply fungicides (e.g., chlorothalonil) at first sign; remove lower infected leaves.</p>
                    <p><strong>Learn More:</strong> <a href="https://extension.psu.edu/early-blight-of-tomato" target="_blank">Penn State Extension</a></p>
                `;
                break;
            case 'late-blight':
                content = `
                    <h5>Late Blight</h5>
                    <p><strong>Symptoms:</strong> Large, grayish-green or water-soaked spots on leaves; white mold in humid conditions; fruit turns brown and rots.</p>
                    <p><strong>Impact:</strong> Can destroy entire crops in days, especially in wet weather.</p>
                    <p><strong>Prevention:</strong> Plant resistant varieties, space plants well, avoid excess moisture.</p>
                    <p><strong>Treatment:</strong> Use fungicides (e.g., mancozeb) preventatively; destroy infected plants immediately.</p>
                    <p><strong>Learn More:</strong> <a href="https://www.extension.umd.edu/resource/late-blight-tomatoes" target="_blank">University of Maryland Extension</a></p>
                `;
                break;
            case 'leaf-mold':
                content = `
                    <h5>Leaf Mold</h5>
                    <p><strong>Symptoms:</strong> Yellow spots on upper leaf surfaces; grayish-white or purplish mold on undersides.</p>
                    <p><strong>Impact:</strong> Reduces leaf area and photosynthesis, lowering yield.</p>
                    <p><strong>Prevention:</strong> Improve greenhouse ventilation, reduce humidity, prune dense foliage.</p>
                    <p><strong>Treatment:</strong> Apply fungicides (e.g., sulfur-based); remove affected leaves carefully.</p>
                    <p><strong>Learn More:</strong> <a href="https://www.missouribotanicalgarden.org/gardens-gardening/your-garden/help-for-the-home-gardener/advice-tips-resources/pests-and-problems/diseases/fungal-spots/leaf-mold-of-tomato.aspx" target="_blank">Missouri Botanical Garden</a></p>
                `;
                break;
            case 'mosaic-virus':
                content = `
                    <h5>Mosaic Virus</h5>
                    <p><strong>Symptoms:</strong> Mottled yellow-green leaves, curling, stunted growth; fruit may be distorted.</p>
                    <p><strong>Impact:</strong> No cure; reduces yield and plant vigor permanently.</p>
                    <p><strong>Prevention:</strong> Use virus-free seeds, control aphids (vectors), disinfect tools between plants.</p>
                    <p><strong>Treatment:</strong> Remove and destroy infected plants; focus on prevention.</p>
                    <p><strong>Learn More:</strong> <a href="https://www.gardeningknowhow.com/edible/vegetables/tomato/tomato-mosaic-virus.htm" target="_blank">Gardening Know How</a></p>
                `;
                break;
            case 'yellow-leaf-curl':
                content = `
                    <h5>Yellow Leaf Curl Virus</h5>
                    <p><strong>Symptoms:</strong> Upward curling leaves, yellowing edges, stunted plants; fruit production drops.</p>
                    <p><strong>Impact:</strong> Severe yield loss; spread by whiteflies.</p>
                    <p><strong>Prevention:</strong> Use insect netting, plant resistant varieties, control whiteflies with sticky traps.</p>
                    <p><strong>Treatment:</strong> Apply insecticides (e.g., neem oil) to manage whiteflies; remove infected plants.</p>
                    <p><strong>Learn More:</strong> <a href="https://www.planetnatural.com/pest-problem-solver/plant-disease/tomato-yellow-leaf-curl/" target="_blank">Planet Natural</a></p>
                `;
                break;
        }

        $('#disease-details').html(content);
        $('#diseaseModalLabel').text(disease.replace('-', ' ').toUpperCase());
    });
});