let setActivityRepeating = function(client, delay) {
    let game;
    let num = Math.floor(Math.random() * 10);
    switch(num) {
        case 0:
            game = 'with Natsuki <3';
            break;
        case 1:
            game = 'with Sayori <3';
            break;
        case 2:
            game = 'with Yuri <3';
            break;
        case 3:
            game = 'Monika Monika Monika <3';
            break;
        case 4:
            game = 'You.';
            break;
        case 5:
            game = 'Doki Doki Literature Club';
            break;
        case 6:
            game = 'with your heart';
            break;
        case 7:
            game = 'Just Monika.';
            break;
        case 8:
            game = 'with the protagonist ;)';
            break;
        case 9:
            game = 'a crazy little thing called love';
            break;
    }
    client.user.setActivity(game);

    setTimeout(setActivity(client), delay)
};

module.exports = setActivity;