// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL =
  "https://edqzsqblqjndyspsajfb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_gsURgAJTcUZTlZ7LwF-BJg_1Wk75nMO";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


// ==========================================
// HTML ELEMENTS
// ==========================================

const form =
  document.getElementById("uploadForm");

const nameInput =
  document.getElementById("name");

const emailInput =
  document.getElementById("email");

const photo1Input =
  document.getElementById("photo1");

const photo2Input =
  document.getElementById("photo2");

const preview1 =
  document.getElementById("preview1");

const preview2 =
  document.getElementById("preview2");

const submitButton =
  document.getElementById("submitButton");

const message =
  document.getElementById("message");


// ==========================================
// PREVIEW FUNCTION
// ==========================================

function createPreview(input, preview) {

  input.addEventListener("change", function () {

    preview.innerHTML = "";

    const file = input.files[0];

    if (!file) {
      return;
    }

    const image =
      document.createElement("img");

    image.src =
      URL.createObjectURL(file);

    image.alt =
      "Selected photo";

    preview.appendChild(image);

  });
}


createPreview(photo1Input, preview1);

createPreview(photo2Input, preview2);


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text) {

  message.textContent = text;
}


// ==========================================
// VALIDATE PHOTO
// ==========================================

function validatePhoto(file) {

  if (!file) {

    return "Please select both photos.";
  }


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  if (!allowedTypes.includes(file.type)) {

    return "Please use JPG, PNG, or WEBP.";
  }


  const maxSize =
    6 * 1024 * 1024;


  if (file.size > maxSize) {

    return "Each photo must be smaller than 6 MB.";
  }


  return null;
}


// ==========================================
// FORM SUBMIT
// ==========================================

form.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    console.log("========== START ==========");


    const name =
      nameInput.value.trim();

    const email =
      emailInput.value.trim();

    const file1 =
      photo1Input.files[0];

    const file2 =
      photo2Input.files[0];


    // --------------------------------------
    // CHECK NAME
    // --------------------------------------

    if (!name) {

      showMessage(
        "Please enter your name."
      );

      return;
    }


    // --------------------------------------
    // CHECK EMAIL
    // --------------------------------------

    if (!email) {

      showMessage(
        "Please enter your email."
      );

      return;
    }


    // --------------------------------------
    // CHECK PHOTO 1
    // --------------------------------------

    const photo1Error =
      validatePhoto(file1);

    if (photo1Error) {

      showMessage(photo1Error);

      return;
    }


    // --------------------------------------
    // CHECK PHOTO 2
    // --------------------------------------

    const photo2Error =
      validatePhoto(file2);

    if (photo2Error) {

      showMessage(photo2Error);

      return;
    }


    submitButton.disabled = true;

    submitButton.textContent =
      "Uploading photos...";

    showMessage("");


    try {

      // ====================================
      // CREATE UNIQUE ORDER ID
      // ====================================

      const orderId =
        crypto.randomUUID();


      console.log(
        "Order ID:",
        orderId
      );


      // ====================================
      // CREATE FILE NAMES
      // ====================================

      const extension1 =
        file1.name
          .split(".")
          .pop()
          .toLowerCase();


      const extension2 =
        file2.name
          .split(".")
          .pop()
          .toLowerCase();


      const path1 =
        orderId +
        "/photo1." +
        extension1;


      const path2 =
        orderId +
        "/photo2." +
        extension2;


      // ====================================
      // UPLOAD PHOTO 1
      // ====================================

      console.log(
        "Uploading photo 1..."
      );


      const result1 =
        await supabaseClient
          .storage
          .from("userphotos")
          .upload(
            path1,
            file1,
            {
              contentType: file1.type,
              upsert: false
            }
          );


      if (result1.error) {

        console.error(
          "PHOTO 1 ERROR:",
          result1.error
        );

        throw new Error(
          "Photo 1 upload failed: " +
          result1.error.message
        );
      }


      console.log(
        "Photo 1 uploaded!"
      );


      // ====================================
      // UPLOAD PHOTO 2
      // ====================================

      console.log(
        "Uploading photo 2..."
      );


      const result2 =
        await supabaseClient
          .storage
          .from("userphotos")
          .upload(
            path2,
            file2,
            {
              contentType: file2.type,
              upsert: false
            }
          );


      if (result2.error) {

        console.error(
          "PHOTO 2 ERROR:",
          result2.error
        );

        throw new Error(
          "Photo 2 upload failed: " +
          result2.error.message
        );
      }


      console.log(
        "Photo 2 uploaded!"
      );


      // ====================================
      // SAVE DATABASE RECORD
      // ====================================

      console.log(
        "Saving order..."
      );


      const result3 =
        await supabaseClient
          .from("photo_orders")
          .insert({
            id: orderId,

            name: name,

            email: email,

            photo1_path: path1,

            photo2_path: path2,

            status: "uploaded"
          });


      if (result3.error) {

        console.error(
          "DATABASE ERROR:",
          result3.error
        );

        throw new Error(
          "Database save failed: " +
          result3.error.message
        );
      }


      console.log(
        "DATABASE RECORD SAVED!"
      );


      // ====================================
      // SUCCESS
      // ====================================

      showMessage(
        "✅ Your two photos were uploaded successfully!"
      );


      submitButton.textContent =
        "Uploaded Successfully";


      form.reset();

      preview1.innerHTML = "";

      preview2.innerHTML = "";


      console.log(
        "========== SUCCESS =========="
      );


    } catch (error) {

      console.error(
        "UPLOAD FAILED:",
        error
      );


      showMessage(
        "❌ " + error.message
      );


      submitButton.disabled =
        false;

      submitButton.textContent =
        "Upload My Photos";
    }

  }
);
