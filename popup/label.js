let currentLabelId = null;

document.addEventListener('DOMContentLoaded', () => {
  const listView = document.getElementById('list-view');
  const formView = document.getElementById('form-view');
  const form = formView;
  const addNewBtn = document.getElementById('add-new');
  const cancelBtn = document.getElementById('cancel');
  const deleteButton = document.getElementById('deleteButton');
  const labelList = document.getElementById('label-list');

  let justifyContent = ""
  let alignItems = ""

  document.querySelectorAll('.alignment-picker option').forEach(button => {
  button.addEventListener('click', () => {
    
    document.querySelectorAll('.alignment-picker option').forEach(option => {
      if(button == option) {
        option.setAttribute("selected", "");  
      } else {
              option.removeAttribute("selected", "");  
      }
      
      
    });
 
    justifyContent = button.getAttribute('data_justify-content');
    alignItems = button.getAttribute('data_align-items');
  });
});

  function showListView() {
    listView.classList.remove('hidden');
    formView.classList.add('hidden');
    currentLabelId = null;
    loadLabelList();
  }

  function showFormView(data = {}) {
    listView.classList.add('hidden');
    formView.classList.remove('hidden');

    // Populate form
    Object.keys(data).forEach((key) => {
      const input = document.getElementById(key);
      if (input) input.value = data[key];
    });
  }

  function loadLabelList() {
    labelList.innerHTML = '';
    browser.storage.local.get().then((items) => {
      const keys = Object.keys(items);
      if (keys.length === 0) {
        labelList.innerHTML = '<li>No labels saved.</li>';
        return;
      }

      keys.forEach((key) => {
        const label = items[key].label || '(no label)';
        const li = document.createElement('li');
        li.innerHTML = `<a href="#">${label}</a>`;
        li.addEventListener('click', () => {
          currentLabelId = key;
          deleteButton.classList.remove('hidden');
          showFormView(items[key]);
        });
        labelList.appendChild(li);
      });
    });
  }

  deleteButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (currentLabelId) {
      browser.storage.local.remove(currentLabelId).then(() => {
        showListView();
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
          browser.tabs.sendMessage(tabs[0].id, {
            reset: true
          });
        });
      }).catch((err) => {
          console.error("Failed to delete style:", err);
        });

    } else {
      alert("No label found to delete.");
    }
  });


  addNewBtn.addEventListener('click', () => {
    currentLabelId = null;
    deleteButton.classList.add('hidden');
    showFormView({});
  });

  cancelBtn.addEventListener('click', showListView);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let labelData = {
      urls: document.getElementById('urls').value,
      label: document.getElementById('label').value,
      backgroundColor: document.getElementById('backgroundColor').value,
      height: document.getElementById('height').value,
      display: 'flex', // document.getElementById('display').value,
      alignItems: alignItems,
      justifyContent: justifyContent,

      position: 'sticky', // document.getElementById('position').value,
      top: 0,// document.getElementById('top').value,
      left: 0,// document.getElementById('left').value,
      zIndex: 10000000,// document.getElementById('zIndex').value,
      width: '100vw',// document.getElementById('width').value,
     fontWeight: 'bold',// document.getElementById('fontWeight').value,
    };

    const labelId = currentLabelId || `label_${Date.now()}`;

    browser.storage.local.set({ [labelId]: labelData }).then(() => {
      // Apply styles to content script
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          applyStyles: true,
          styles: labelData
        });
      });

      showListView();
    });
  });

  showListView();
});




