let transactions = [];
let myChart;

fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data
        }]
    }
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();
  
  // also send to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
  .then(response => {    
    return response.json();
  })
  .then(data => {
    if (data.errors) {
      errorEl.textContent = "Missing Information";
    }
    else {
      // clear form
      nameEl.value = "";
      amountEl.value = "";
    }
  })
  .catch(err => {
    // fetch failed, so save in indexed db
    saveRecord(transaction);

    // clear form
    nameEl.value = "";
    amountEl.value = "";
  });
};

function saveRecord(transaction) {
  // can I create an offline balance estimate table in leiu of the populates
  let db = null; //do I want this called out or just declared?
  let DBOpenReq = indexedDB.open('budgetDB', 1); //do I want a variable to define and increment version?

  const entry = {
    id: Date.now(), // can I autoIncrement? do I need this if keypath is the timestamp and date is part? I don't think so but I won't remove until verified.
    name: 'input',
    value: 'input',
    date: 'input', // passed into saveRecord as transaction
  };

  DBOpenReq.addEventListener('error', (err) => {
    console.warn(err);
  }); 

  DBOpenReq.addEventListener('success', (err) => {
    db = ev.target.result;
    console.log('success', db);
  }); 

  DBOpenReq.addEventListener('upgradeneeded', (err) => {
    db = ev.target.result;
    let oldVersion = ev.oldVersion;
    let newVersion = ev.newVersion || db.version;
    console.log('DB updated from version', oldVersion, ' to ', newVersion);
    if (!objectStoreNames.contains('budgetStore')) {
      objectStore = db.createObjectStore('budgetStore', {
        keyPath: Date.now(), // as this will only be manually entered transactions, milliseconds should be sufficiently unique I think (hope?)
      });
    }

    function makeTX(storeName, mode) {
      let tx = db.transaction(storeName, mode);
      txonerror = (err) =>{
        console.warn(err);
      };
      return tx;
    }

    tx.oncomplete = (ev) => {
      console.log(ev, 'complete');
      // display table with last known balance and table of transactions awaiting upload: local storage for last known balance, display that "you are offline and last know balance may not be accurate if transactions have been posted from another location"?
      // look at line 95 in testing.js
      // clear form

    };

    let store = tx.objectStore('budgetStore');
    let request = store.add(entry);

    request.onsuccess = (ev) => {
        console.log('did it');
        // this means this one was a success
        // move on to the next request or commit the transaction
    }
    request.onerror = (err) => {
        console.log('oops')
    };
}) 

}



document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};
