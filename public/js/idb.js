let db;
const request = indexedDB.open('my_budget', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('my_balance', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    updateBalance();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['my_balance'], 'readwrite');
  const balanceObjectStore = transaction.objectStore('my_balance');
  balanceObjectStore.add(record);
}

function updateBalance() {
  const transaction = db.transaction(['my_balance'], 'readwrite');
  const balanceObjectStore = transaction.objectStore('my_balance');
  const getAll = balanceObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        const transaction = db.transaction(['my_balance'], 'readwrite');
        const balanceObjectStore = transaction.objectStore('my_balance');
        balanceObjectStore.clear();

        alert('Updated balance has been submitted!');
      })
      .catch(err => {
        console.log(err);
      });
    }
  };
}

window.addEventListener('online', updateBalance);