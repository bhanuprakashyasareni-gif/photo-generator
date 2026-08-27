// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
  "https://edqzsqblqjndyspsajfb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_gsURgAJTcUZTlZ7LwF-BJg_1Wk75nMO";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// ELEMENTS
// ==========================================

const form = document.getElementById("uploadForm");

const photo1 = document.getElementById("photo1");
const photo2 = document.getElementById("photo2");

const preview1 = document.getElementById("preview1");
const preview2 = document.getElementById("preview2");

const submitButton =
  document.getElementById("submitButton");

const message =
  document.getElementById("message");


// ==========================================
// PHOTO PREVIEW
// ==========================================

function showPreview(input, preview) {

  input.addEventListener("change", () => {

    const file = input.files[0];

    if (!file) {
      preview.innerHTML = "";
      return;
    }

    const imageURL =
      URL.createObjectURL(file);

    preview.innerHTML = `
      <img
        src="${imageURL}"
        alt="Selected photo"
      >
    `;
  });
}

showPreview(photo1, preview1);
showPreview(photo2, preview2);


// ==========================================
// VALIDATE IMAGE
// ==========================================

function validateImage(file) {

  if (!file) {
    return "Please select both photos.";
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  const maxSize = 6 * 1024 * 1024;

  if (file.size > maxSize) {
    return "Each photo must be smaller than 6 MB.";
  }

  return null;
}


// ==========================================
// SUBMIT
// ==========================================

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  console.log("SUBMIT STARTED");


  try {

    // --------------------------------------
    // USER INFORMATION
    // --------------------------------------

    const name =
      document.getElementById("name")
        .value
        .trim();

    const email =
      document.getElementById("email")
        .value
        .trim();


    const file1 = photo1.files[0];
    const file2 = photo2.files[0];


    // --------------------------------------
    // VALIDATION
    // --------------------------------------

    if (!name) {

      message.textContent =
        "Please enter your name.";

      return;
    }


    if (!email) {

      message.textContent =
        "Please enter your email.";

      return;
    }


    const error1 =
      validateImage(file1);

    if (error1) {

      message.textContent =
        error1;

      return;
    }


    const error2 =
      validateImage(file2);

    if (error2) {

      message.textContent =
        error2;

      return;
    }


    // --------------------------------------
    // BUTTON
    // --------------------------------------

    submitButton.disabled = true;

    submitButton.textContent =
      "Uploading...";

    message.textContent = "";


    // --------------------------------------
    // CREATE ORDER ID
    // --------------------------------------

    const orderId =
      crypto.randomUUID();

    console.log(
      "Order ID:",
      orderId
    );


    // --------------------------------------
    // FILE EXTENSIONS
    // --------------------------------------

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


    // --------------------------------------
    // STORAGE PATHS
    // --------------------------------------

    const photo1Path =
      `${orderId}/photo1.${extension1}`;

    const photo2Path =
      `${orderId}/photo2.${extension2}`;


    console.log(
      "Uploading photo 1:",
      photo1Path
    );


    // ======================================
    // UPLOAD PHOTO 1
    // ======================================

    const {
      data: uploadData1,
      error: uploadError1
    } = await supabaseClient
      .storage
      .from("userphotos")
      .upload(
        photo1Path,
        file1,
        {
          contentType: file1.type,
          upsert: false
        }
      );


    if (uploadError1) {

      console.error(
        "PHOTO 1 ERROR:",
        uploadError1
      );

      throw new Error(
        "Photo 1 upload failed: " +
        uploadError1.message
      );
    }


    console.log(
      "Photo 1 uploaded:",
      uploadData1
    );


    // ======================================
    // UPLOAD PHOTO 2
    // ======================================

    console.log(
      "Uploading photo 2:",
      photo2Path
    );


    const {
      data: uploadData2,
      error: uploadError2
    } = await supabaseClient
      .storage
      .from("userphotos")
      .upload(
        photo2Path,
        file2,
        {
          contentType: file2.type,
          upsert: false
        }
      );


    if (uploadError2) {

      console.error(
        "PHOTO 2 ERROR:",
        uploadError2
      );

      throw new Error(
        "Photo 2 upload failed: " +
        uploadError2.message
      );
    }


    console.log(
      "Photo 2 uploaded:",
      uploadData2
    );


    // ======================================
    // SAVE ORDER
    // ======================================

    console.log(
      "Saving order to database..."
    );


    const {
      data: orderData,
      error: databaseError
    } = await supabaseClient
      .from("photo_orders")
      .insert({
        id: orderId,

        name: name,

        email: email,

        photo1_path: photo1Path,

        photo2_path: photo2Path,

        status: "uploaded"
      })
      .select()
      .single();


    if (databaseError) {

      console.error(
        "DATABASE ERROR:",
        databaseError
      );

      throw new Error(
        "Could not save your order: " +
        databaseError.message
      );
    }


    console.log(
      "ORDER SAVED:",
      orderData
    );


    // ======================================
    // SUCCESS
    // ======================================

    message.textContent =
      "✅ Photos uploaded successfully!";

    submitButton.textContent =
      "Submitted";


    form.reset();

    preview1.innerHTML = "";
    preview2.innerHTML = "";


  } catch (error) {

    console.error(
      "FINAL ERROR:",
      error
    );


    message.textContent =
      error.message ||
      "Something went wrong.";


    submitButton.disabled = false;

    submitButton.textContent =
      "Generate My Image";
  }

});
