function restore_options() {
  chrome.storage.sync.get(
    {
      src_lang: "es",
      user_lang: "en",
      showsec: 5,
      delay: true,
      images: false,
    },
    function (items) {
      document.querySelector('select[name="src_lang"]').value = items.src_lang;
      document.querySelector('select[name="user_lang"]').value =
        items.user_lang;
      document.querySelector('input[name="images"]').checked = items.images;
      document.querySelector('input[name="delay"]').checked = items.delay;
      document.querySelector('select[name="showsec"]').value = items.showsec;
    }
  );
}

function save_options() {
  function get_value(name) {
    return document.querySelector('select[name="' + name + '"]').value;
  }

  chrome.storage.sync.set({
    src_lang: get_value("src_lang"),
    user_lang: get_value("user_lang"),
    delay: get_value("delay"),
    images: get_value("images"),
    showsec: get_value("showsec"),
  });
}

function add_save_event(name) {
  document
    .querySelector('select[name="' + name + '"]')
    .addEventListener("change", save_options);
}

add_save_event("src_lang");
add_save_event("user_lang");
add_save_event("delay");
add_save_event("images");
add_save_event("showsec");

document.addEventListener("DOMContentLoaded", restore_options);
