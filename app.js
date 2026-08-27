
const form = document.getElementById("uploadForm");

const photo1 = document.getElementById("photo1");
const photo2 = document.getElementById("photo2");

const preview1 = document.getElementById("preview1");
const preview2 = document.getElementById("preview2");

const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");

const SUPABASE_URL ="https://edqzsqblqjndyspsajfb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY ="sb_publishable_gsURgAJTcUZTlZ7LwF-BJg_1Wk75nMO";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
function showPreview(input, preview) {

  input.addEventListener("change", () => {

    const file = input.files[0];

    if (!file) {
      preview.innerHTML = "";
      return;
    }

    const imageURL = URL.createObjectURL(file);

    preview.innerHTML = `
      <img src="${imageURL}" alt="Selected photo">
    `;
  });
}


showPreview(photo1, preview1);
showPreview(photo2, preview2);


form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  const file1 = photo1.files[0];
  const file2 = photo2.files[0];


  if (!file1 || !file2) {

    message.textContent = "Please select both photos.";

    return;
  }


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  if (!allowedTypes.includes(file1.type) ||
      !allowedTypes.includes(file2.type)) {

    message.textContent =
      "Please upload JPG, PNG, or WEBP images.";

    return;
  }


  const maxSize = 6 * 1024 * 1024;


  if (file1.size > maxSize || file2.size > maxSize) {

    message.textContent =
      "Each photo must be smaller than 6 MB.";

    return;
  }


  submitButton.disabled = true;

  submitButton.textContent = "Uploading...";

  message.textContent = "";


  /*
    STAGE 2 WILL GO HERE.

    We will connect this form to Supabase.

    The information sent will be:

      name
      email
      photo 1
      photo 2
  */


  console.log({
    name,
    email,
    photo1: file1,
    photo2: file2
  });


  await new Promise(resolve => setTimeout(resolve, 1000));


  message.textContent =
    "Photos received. Storage connection coming next.";

  submitButton.disabled = false;

  submitButton.textContent = "Generate My Image";

});
