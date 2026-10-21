const cl = console.log;
const studentForm = document.getElementById('studentForm');
const stdname = document.getElementById('stdname');
const email = document.getElementById('email');
const age = document.getElementById('age');
const number = document.getElementById('number');
const course = document.getElementById('course');
const isActive = document.getElementById('isActive');

const addStudentBtn = document.getElementById('addStudentBtn');
const updateStudentBtn = document.getElementById('updateStudentBtn');

const studentList = document.getElementById('studentList');

const spinner = document.getElementById('spinner');

const base_url = `https://cruds-cd68e-default-rtdb.firebaseio.com/`;
const student_url = `${base_url}/student1.json`;


const state = {
    studentArr: [],
    edit_id: null
}
function toggleSpinner(flag) {
    if (flag) {
        spinner.classList.remove('d-none');
    }
    else {
        spinner.classList.add('d-none');
    }
}


function snackBar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}


function objToArr(obj) {
    state.studentArr = [];
    if (!obj) {
        return;
    }
    for (const key in obj) {
        obj[key].id = key;
        state.studentArr.push(obj[key]);
    }
}

function makeAPICALL(url, method = 'GET', body = null) {
    body = body ? JSON.stringify(body) : null;
    return fetch(url, {
        method: method,
        body: body,
        headers: {
            "content-type": "application/json",
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('HTTP Error:' + res.status)
            }
            return res.json()
        })
}

//read
function createStudent(arr) {
    let res = ``;
    arr.forEach((std, i) => {
        res += `
          <tr id="${std.id}">
                        <td>${i + 1}</td>
                        <td>${std.stdname}</td>
                        <td>${std.email}</td>
                        <td>${std.age}</td>
                        <td>${std.number}</td>
                        <td>${std.course}</td>
                        <td>${std.isActive === 'true' ? 'Active' : 'InActive'}</td>
                        <td class="d-flex justify-content-between">
                            <button class="btn-info" onclick="onEdit(this)">Edit</button>
                            <button class="btn-danger" onclick="onRemove(this)">Delete</button>
                        </td>
                    </tr>
        `
    })
    studentList.innerHTML = res;
}

function fetchStudent() {
    toggleSpinner(true);
    makeAPICALL(student_url)
        .then(data => {
            objToArr(data);
            createStudent(state.studentArr);
        })
        .catch(err => {
            snackBar(err.message, 'error');
        })
        .finally(() => {
            toggleSpinner(false);
        })
}
fetchStudent();

//CREATE
function onAddStudent(eve) {
    eve.preventDefault();
    const std_obj = {
        stdname: stdname.value,
        email: email.value,
        age: age.value,
        number: number.value,
        course: course.value,
        isActive: isActive.value
    }
    toggleSpinner(true);
    makeAPICALL(student_url, "POST", std_obj)
        .then(data => {
            std_obj.id = data.name;
            state.studentArr.push(std_obj);
            let tr = document.createElement('tr');
            tr.id = std_obj.id;
            tr.innerHTML = `
             <td>${state.studentArr.length}</td>
                        <td>${std_obj.stdname}</td>
                        <td>${std_obj.email}</td>
                        <td>${std_obj.age}</td>
                        <td>${std_obj.number}</td>
                        <td>${std_obj.course}</td>
                        <td>${std_obj.isActive === 'true' ? 'Active' : 'inActive'}</td>
                        <td class="d-flex justify-content-between">
                            <button class="btn-info" onclick="onEdit(this)">Edit</button>
                            <button class="btn-danger" onclick="onRemove(this)">Delete</button>
                        </td>
            `
            studentList.append(tr);
            snackBar(`new Student added successfully`, 'success');
            studentForm.reset();
        })
        .catch(err => {
            snackBar(err.message, 'error');
        })
        .finally(() => {
            toggleSpinner(false);
        })
}


//EDIT
function onEdit(ele) {
    let EDIT_ID = ele.closest('tr').id;
    state.edit_id = EDIT_ID;
    let EDIT_OBJ = state.studentArr.find(s => s.id === EDIT_ID);
    stdname.value = EDIT_OBJ.stdname;
    email.value = EDIT_OBJ.email;
    age.value = EDIT_OBJ.age;
    number.value = EDIT_OBJ.number;
    course.value = EDIT_OBJ.course;
    isActive.value = EDIT_OBJ.isActive;
    addStudentBtn.classList.add('d-none');
    updateStudentBtn.classList.remove('d-none');
}



//UPDATE 
function onUpdateStudent() {
    let UPDATE_ID = state.edit_id;
    const update_obj = {
        stdname: stdname.value,
        email: email.value,
        age: age.value,
        number: number.value,
        course: course.value,
        isActive: isActive.value
    };
    const update_url = `${base_url}/student1/${UPDATE_ID}.json`;
    toggleSpinner(true);
    makeAPICALL(update_url, "PATCH", update_obj)
        .then(data => {
            const index = state.studentArr.findIndex(std => std.id === state.edit_id);
            state.studentArr[index] = {
                ...update_obj,
                id: state.edit_id
            };
            let tr = document.getElementById(UPDATE_ID);
            tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td> ${data.stdname}</td>
                        <td>${data.email}</td>
                        <td>${data.age}</td>
                        <td>${data.number}</td>
                        <td>${data.course}</td>
                        <td>${data.isActive === 'true' ? 'Active' : 'inActive'}</td>
                        <td class="d-flex justify-content-between">
                            <button class="btn-info" onclick="onEdit(this)">Edit</button>
                            <button class="btn-danger" onclick="onRemove(this)">Delete</button>
                        </td>
                        `
            snackBar('Student updated successfully', 'success');
            studentForm.reset();
            state.edit_id = null;
            addStudentBtn.classList.add('d-none');
            updateStudentBtn.classList.remove('d-none');
        })
        .catch(err => {
            snackBar(err.message, 'error');
        })
        .finally(() => {
            toggleSpinner(false);
        });
}


//Remove
function onRemove(ele) {
    const removeId = ele.closest('tr').id;
    const remove_url = `${base_url}/student1/${removeId}.json`;
    Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this student?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        cancelButtonText: 'Cancel'
    })
        .then(getConfirm => {
            if (getConfirm.isConfirmed) {
                toggleSpinner(true);
                makeAPICALL(remove_url, "DELETE")
                    .then(() => {
                        let getIndex = state.studentArr.findIndex(std => std.id === removeId);
                        if (getIndex !== -1) {
                            state.studentArr.splice(getIndex, 1);
                        }
                        ele.closest('tr').remove();
                        let tr = document.querySelectorAll("#studentList tr td:first-child")
                        tr.forEach((e, i) => e.innerText = i + 1)

                        snackBar(`The Student with ${removeId} is removed successfully`, 'success');
                    })
                    .catch(err => {
                        snackBar(err.message, 'error');
                    })
                    .finally(() => {
                        toggleSpinner(false);
                    });
            }
        });
}
studentForm.addEventListener('submit', onAddStudent);
updateStudentBtn.addEventListener('click', onUpdateStudent);