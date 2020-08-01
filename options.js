function restore_options() {
  chrome.storage.sync.get(
    {
      src_lang: "es",
      user_lang: "en",
      showsec: 5,
      delay: true,
      images: false,
      auto_translate: true,
    },
    function (items) {
      document.querySelector('select[name="src_lang"]').value = items.src_lang;
      document.querySelector('select[name="user_lang"]').value =
        items.user_lang;
      document.querySelector('input[name="images"]').checked = items.images;
      document.querySelector('input[name="delay"]').checked = items.delay;
      document.querySelector('input[name="auto_translate"]').checked =
        items.auto_translate;
      document.querySelector('select[name="showsec"]').value = items.showsec;
    }
  );
}

function save_options() {
  function get_value(type, name) {
    return document.querySelector(type + '[name="' + name + '"]').value;
  }

  chrome.storage.sync.set({
    src_lang: get_value("select", "src_lang"),
    user_lang: get_value("select", "user_lang"),
    auto_translate: get_value("input", "auto_translate"),
    delay: get_value("input", "delay"),
    images: get_value("input", "images"),
    showsec: get_value("select", "showsec"),
  });
}

function add_save_event(type, name) {
  document
    .querySelector(type + '[name="' + name + '"]')
    .addEventListener("change", save_options);
}

add_save_event("select", "src_lang");
add_save_event("select", "user_lang");
add_save_event("input", "delay");
add_save_event("input", "auto_translate");
add_save_event("input", "images");
add_save_event("select", "showsec");

document.addEventListener("DOMContentLoaded", restore_options);
