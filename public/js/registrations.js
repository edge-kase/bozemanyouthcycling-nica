$(function () {
    var db = firebase.firestore();

    db.collection("registrations")
        .onSnapshot(function (querySnapshot) {
            var registrationCount = 0;
            querySnapshot.forEach((doc) => {
                registrationCount += 1;
                console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
            });
            document.querySelector('#registration-count').innerHTML = '2018 Registrations: ' + registrationCount;
            console.log('count', registrationCount);
            console.log('q', querySnapshot.size);

            $('.progress').hide();
        });

    db.collection("registrations")
    .where("age_june_1", "==", "6")
    //.orderBy("timestamp")
    .orderBy("last_name")
        .onSnapshot(function (querySnapshot) {
            console.log('load registrations');            
            $('#meadow-pedalers-list').empty();
            querySnapshot.forEach((doc) => {
                let registration = doc.data();
                $('#meadow-pedalers-list').append('<tr><td>' + registration.first_name + ' ' + registration.last_name + '</td>'
                    // +'<td>'+ registration.gender + '</td>'
                    + '<td>' + registration.gender + '</td>'
                    + '<td><div><strong>' + registration.primary_first_name + '</strong></div>'
                    + '    <span>' + registration.primary_email + '</span></td>'
                    + '<td class="right"><i class="delete-btn material-icons small" data-doc-id="' + doc.id + '">clear</i></td>'
                    + '</tr>');
            });
            console.log('q.size 6-7-mon', querySnapshot.size);
            document.querySelector('#meadow-pedalers-mon').innerHTML = querySnapshot.size;
            console.log('q.docChanges.size 6-7-mon', querySnapshot.docChanges.length);
            console.log('q', querySnapshot);
            console.log('q.docChanges', querySnapshot.docChanges);

            $('.delete-btn').click(function (el) {
                console.log($(el.target).data('doc-id'));
                db.collection("registrations").doc($(el.target).data('doc-id')).delete()
                    .then(function () {
                        console.log("Document successfully deleted!");
                    }).catch(function (error) {
                        console.error("Error removing document: ", error);
                    });;
            });
        });
});