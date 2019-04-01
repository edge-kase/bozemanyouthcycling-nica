
function appendProgramSection(program) {
    var grades = program.grades.length === 1
        ? `${program.grades[0]}`
        : `${program.grades[0]} - ${program.grades[program.grades.length - 1]}`;

    $('#program-container').append(
        ` <section class="program-panel">
        <h2>${program.name} (${grades})${program.day ? ' | ' + program.day : ''} (limit ${program.limit})
            <span id="${program.id}-badge" class="badge new" data-badge-caption="">loading...</span>
        </h2>
        <div class="divider teal"></div>
        <table class="highlight program-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Age / Gender</th>
                    <th>School / Grade</th>
                    <th>Contact / Address</th>
                    <th>Primary Emergency Contact</th>
                    <th>Secondary Emergency Contact</th>
                    <th>Health Concerns</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="${program.id}-list"></tbody>
        </table>
    </section>`
    );
}

function appendRegistration(listId, registration, index) {
    $('#' + listId).append(`<tr data-doc-id="${registration.id}">
        <td>${index + 1} ${registration.first_name} ${registration.last_name}<br/>
            <small class="light">${registration.timestamp.toDate().toLocaleDateString()} ${registration.timestamp.toDate().toLocaleTimeString()}</small></td>
        <td>${registration.age_june_1} / ${registration.gender}
            <div class="light">${registration.birthdate}</div></td>
        <td>${registration.school} / ${registration.grade}</td>
        <td>${registration.street_1}
         ${(registration.street_2 ? `<br/>${registration.street_2}` : '')}
        <br/>${registration.city}, ${registration.state} ${registration.zipcode}
        <td><div><strong>${registration.primary_first_name} ${registration.primary_last_name}</strong></div>
            <div>${registration.primary_email}</div>
            <div class="light">${registration.primary_phone}</div></td>
        <td><div><strong>${registration.secondary_first_name} ${registration.secondary_last_name}</strong></div>
            <div>${registration.secondary_email}</div>
            <div class="light">${registration.secondary_phone}</div></td>
        <td>${(registration.health_concerns === undefined) ? '' : registration.health_concerns}</td>
        <td>
            <p>
               <label>
                    <input id="photos" name="photos" disabled type="checkbox" ${(registration.photo_permission === undefined || registration.photo_permission !== 'No') ? 'checked' : ''}>
                    <span>Photos</span>
                </label>
            </p>
            <p>
                <label>
                    <input id="paid${index}" name="paid" type="checkbox" ${(registration.paid === 'Yes') ? 'checked' : ''}>
                    <span>Paid</span>
                </label>
            </p>
            <p>
                <label>
                    <input id="waiver${index}" name="waiver" type="checkbox" ${(registration.waiver === 'Yes') ? 'checked' : ''}>
                    <span>Waiver</span>
                </label>
            </p></td>
        <td class="right">
            <i class="delete-btn material-icons small">clear</i></td>
    </tr>`);
}

$(function () {
    programs.forEach(function (program) {
        appendProgramSection(program);
        program.participants.forEach(function (registration) {
            appendRegistration(getProgramId(program) + '-list', registration);
        });
    });

    var db = firebase.firestore();

    db.collection("registrations")
        .orderBy("timestamp")
        .onSnapshot(function (querySnapshot) {
            console.log(querySnapshot);

            programs.forEach(function (program, i) { program.participants = []; });

            querySnapshot.forEach((doc) => {
                var participant = doc.data();
                participant.id = doc.id;
                var program = getProgram(participant);

                if (program === undefined) {
                    console.log('program not found for', doc.id);
                    program = programs[0];
                }

                program.participants.push(participant);
            });
            document.querySelector('#registration-count').innerHTML = '2019 Registrations: ' + querySnapshot.size;

            programs.forEach(function (program, i) {
                var isFull = program.participants.length >= program.limit;
                if (isFull) {
                    $('#' + program.id + '-badge').addClass('materialize-red');
                }
                $('#' + program.id + '-badge').text(program.participants.length + (isFull ? ' FULL' : ''));
                $(`#${program.id}-list`).empty(); //todo just load change (add/remove)
                program.participants.forEach(function (registration, index) {
                    appendRegistration(program.id + '-list', registration, index);
                });
            });

            $('[name = paid], [name = waiver]').click(function (e) {
                var element = $(this);//e.target
                var ref = db.collection("registrations").doc(element.parents('tr').data('doc-id'));

                ref.update({
                    paid: element.closest('tr').find('[name = paid]').is(':checked') ? 'Yes' : 'No',
                    waiver: element.closest('tr').find('[name = waiver]').is(':checked') ? 'Yes' : 'No'
                })
                    .then(function () {
                        console.log("Document successfully updated!");
                    }).catch(function (error) {
                        console.error("Error updating document: ", error);
                    });
            })

            $('.delete-btn').click(function (e) {
                db.collection("registrations").doc($(e.target).closest('tr').data('doc-id')).delete()
                    .then(function () {
                        console.log("Document successfully deleted!");
                    }).catch(function (error) {
                        console.error("Error removing document: ", error);
                    });
            });

            $('.progress').hide();
        });
});