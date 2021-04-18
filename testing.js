// from Steve Griffith https://www.youtube.com/playlist?list=PLyuRouwmQCjmNyAysdqjNz5fIS5cYU4vi

const { format } = require("morgan");

// wrap all this in const IDB? = (function init() {***})
let db = null;
let objectStore = null;
let DBOpenReq = indexedDB.open('BudgetDB', 1);
// let newVersion += currentVersion 

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
    console.log('upgrade', db);
    if (!objectStoreNames.contains('budgetStore')) {
        objectStore = db.createObjectStore('budgetStore', {
            keyPath: "id",
            autoIncrement: true,
        }); 
    }

    db.createObjectStore('foobar');
});

// document.transactionForm.addEventListener('submit', (ev) => {
//     ev.preventDefault();
// take in input
// let thing = {input object}

// let tx = db.transaction('budgetStore', 'readWrite');
// tx.oncomplete = (ev) => {
//     console.log(ev);
// }   could do callback function, could display data, etc
// tx.onerror = (err) => {
//     console.warn(err);
// }
let store = tx.objectStore('budgetStore');
let request = store.add(thing) // from inside event listener line 37
// });

function makeTX(storeName, mode) {
    let tx = db.transaction(storeName, mode);
    tx.onerror = (err) => {
        console.warn(err);
    };
    return tx;
}


// submit function (eventlistener, ev.preventDefault)
//     define input values from form
//     define object = {
//         id: uid function, 
//         other input: values,
//     }
// ____________________________________________________________
//     // define and start transaction to wrap requests
//     let tx = makeTX(see above);
//     tx.oncomplete = (ev) => {
//         console.log(ev);
//         things I want it to do
//         // build list ();
//         // clear form ();
//     };

//     // identify which store:
//     let store = tx.objectStore('theStore');
//     let request = store.add(the one I defined up there)

//     request.onsuccess = (ev) => {
//         console.log('did it');
//         // this means this one was a success
//         // move on to the next request or commit the transaction
//     }
//     request.onerror = (err) => {
//         console.log(oops)
//     };

____________________________________________________________

// whenever you're building something new in the html:
//     first step: get rid of the old stuff
//         let list = html location;
//         list.innerHTML = <li>Loading...</li>
//         let tx = makeTX('theStore', 'readonly');
//         tx.oncomplete = (ev) => {
//             // transaction for reading all objects is complete
//         }
//         let store = tx.objectStore('theStore');
//         let getReq = store.getAll();
//         // returns an array
//         // option can pass in a key or keyRange
//         getReq.onsuccess = (ev) => {
//             // getAll was successful
//             let request = ev.target; // request === getReq === ev.target
//             console.log({ request });
//             // replace Loading.... with list
//             list.innerHTML = request.result.map(item => {
//                 return `<li data-key="${example.id}"><span>${example.name}</span></li>`
//             }).join('\n'); //makes new line after each one
//         }
//         getReq.onerror = (err) => {
//             console.warn(err);
//         }

_______________________________________________________________

// call the buildList ^^^ function inside the success listener 
//         DBOpenReq.addEventListener('success'... 