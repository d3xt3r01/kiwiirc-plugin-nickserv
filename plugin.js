import services from './components/services.vue';
import confirmdialog from './components/confirmdialog.vue';
import nsdialog from './components/nsdialog.vue';
import nslogindialog from './components/nslogindialog.vue';
import nsregisterdialog from './components/nsregisterdialog.vue';

import './style.css'

kiwi.plugin('nickserv', function(kiwi) {

    // Plugin Config #########################################################################

    // NickServ Identify Regex
    var IDString = "^Questo nick è registrato e protetto. Se questo è il tuo";
    // Wrong password Regex
    var WPString = "^Password errata";
    // Wrong password text
    var WPText = "Password errata!";
    // Bad password text on register
    var BPText = "Attenzione, prova di nuovo con una password più sicura.<br> Le password devono essere lunghe almeno 5 caratteri, non devono essere facilmente intuibili (ad es. il proprio nome o nick)<br> e non possono contenere i caratteri di spazio e di tabulazione.";
    // Services enforce nick Regex
    var ENString = "^Il tuo nick sarà cambiato in";
    // Login success Regex
    var LSString = "^Password accettata - adesso sei riconosciuto";
    // Account confirmation request Regex
    var ConfirmReqString = "^Il tuo indirizzo email non è stato confermato. Per confermarlo, segui le istruzioni contenute nella email che hai ricevuto quando ti sei registrato";
    // Invalid Confirmation code Regex
    var InvalidConfirmString = "^Codice di attivazione non valido";
    // Invalid Confirmation code text
    var InvalidConfirmText = "Codice di attivazione non valido. Inserisci il codice di conferma ricevuto per email per completare la registrazione dell\' account.";
    // A valid confirmation code has been entered
    var ValidConfirmString = "^Il tuo indirizzo email per (.*) è stato confermato.";
    // Bad Password Notify
    var BadPwdString = "^Attenzione, prova di nuovo con una password più sicura.";
    // Bad Email Notify
    var BadEmailString = "non è un indirizzo e-mail valido.";
    // Register delay
    var RegDelayString = "^E' necessario aver usato questo nick per almeno 30 secondi prima di poterlo registrare.";
    // Valid Password
    var ValidPwdString = "^Password accettata - adesso sei riconosciuto.";
    // Already identified
    var AlreadyIdString ="^Sei già identificato.";
    // End Plugin Config  ####################################################################

    var IDRe = new RegExp(IDString ,"");
    var WPRe = new RegExp(WPString ,"");
    var ENRe = new RegExp(ENString ,"");
    var LSRe = new RegExp(LSString ,"");
    var ConfirmReqRe = new RegExp(ConfirmReqString ,"");
    var InvalidConfirmRe = new RegExp(InvalidConfirmString ,"");
    var ValidConfirmRe = new RegExp(ValidConfirmString ,"");
    var BadPwdRe = new RegExp(BadPwdString ,"");
    var BadEmailRe = new RegExp(BadEmailString ,"");
    var RegDelayRe = new RegExp(RegDelayString ,"");
    var ValidPwdRe = new RegExp(ValidPwdString ,"");
    var AlreadyIdRe = new RegExp(AlreadyIdString ,"");

    var data = new kiwi.Vue({data: {themeName: ''}});
    data.themeName = kiwi.themes.currentTheme().name.toLowerCase();

    kiwi.on('theme.change', function(event) {
        data.themeName = kiwi.themes.currentTheme().name.toLowerCase();
        console.log(data.themeName);

    });

    kiwi.addView('IRC Services CP', services);

    function registerFn() {
         kiwi.state.$emit('mediaviewer.show', {component: nsregisterdialog });
    }

    function cpanelFn() {
         kiwi.showView('IRC Services CP');
    }

    function logoutFn() {
         kiwi.state.$emit('input.raw', '/NS Logout' );
    }

    function loginFn() {
         kiwi.state.$emit('mediaviewer.show', {component: nslogindialog });
    }


    var RegBtn = document.createElement('div');
    RegBtn.className = 'kiwi-statebrowser-register';
    RegBtn.addEventListener("click", registerFn );
    RegBtn.innerHTML = '<i aria-hidden="true" class="fa fa-lock"></i>';
    kiwi.addUi('browser', RegBtn);

    var loginBtn = document.createElement('a');
    loginBtn.innerHTML = '<i aria-hidden="true" class="fa fa-sign-in"></i><span>Login</span>';
    loginBtn.addEventListener("click", loginFn);
    kiwi.addUi('header_channel', loginBtn);

    kiwi.once('network.connecting', function(event) {

        var loginNick = event.network.nick;
        var loginPass = event.network.connection.password;
        //kiwi.addTab('server', 'IRC Services CP', services );

        var http = new XMLHttpRequest();
        var url = 'https://webcpanel.simosnap.com/';
        var params = 'username='+loginNick+'&password='+loginPass;
        http.open('POST', url, true);

        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.withCredentials = true;
        http.send(params);
    });

    kiwi.on('irc.mode', function(event, network) {
        //console.log(event);
        if ((event.nick == "NickServ") && (event.target == network.nick)) {
            setTimeout(function() {
                var net = kiwi.state.getActiveNetwork();
                console.log(net.ircClient.user.modes.has('r'));
                var hasR = net.ircClient.user.modes.has('r');

                if (hasR == true) {
                        loginBtn.innerHTML = '<i aria-hidden="true" class="fa fa-sign-out"></i><span>Logout</span>';
                        loginBtn.removeEventListener("click", loginFn);
                        loginBtn.addEventListener("click", logoutFn);
                        RegBtn.removeEventListener("click", registerFn );
                        RegBtn.addEventListener("click", cpanelFn );
                        RegBtn.innerHTML = '<i aria-hidden="true" class="fa fa-dashboard"></i>';
                        //RegBtn.style.visibility="hidden";
                    } else {
                        loginBtn.innerHTML = '<i aria-hidden="true" class="fa fa-sign-in"></i><span>Login</span>';
                        loginBtn.removeEventListener("click", logoutFn);
                        loginBtn.addEventListener("click", loginFn);
                        RegBtn.removeEventListener("click", cpanelFn );
                        RegBtn.addEventListener("click", registerFn );
                        RegBtn.innerHTML = '<i aria-hidden="true" class="fa fa-lock"></i>';
                        //RegBtn.style.visibility="visible";
                        var http = new XMLHttpRequest();
                        var url = 'https://webcpanel.simosnap.com/logout';
                        http.open('GET', url, true);

                        //Send the proper header information along with the request
                        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

                        http.withCredentials = true;
                        http.send();
                    }

                }, 0);
        }

    });

    kiwi.on('irc.notice', function(event) {

        if ((event.nick == 'NickServ') && (event.message.match(IDRe))) {
                kiwi.state.$emit('mediaviewer.show', {component: nsdialog })
            }
        if ((event.nick == 'NickServ') && (event.message.match(WPRe))) {
                var el = document.getElementById("validate")
                el.innerHTML = WPText ;
            }
        if ((event.nick == 'NickServ') && (event.message.match(ConfirmReqRe))) {
                kiwi.state.$emit('mediaviewer.show', {component: confirmdialog })
            }

        if ((event.nick == 'NickServ') && (event.message.match(InvalidConfirmRe))) {
                var el = document.getElementById("validate")
                el.innerHTML = InvalidConfirmText ;
            }

        if ((event.nick == 'NickServ') && (event.message.match(ENRe))) {
                kiwi.state.$emit('mediaviewer.hide')
            }

        if ((event.nick == 'NickServ') && (event.message.match(LSRe))) {
                kiwi.state.$emit('mediaviewer.hide')
            }

        if ((event.nick == 'NickServ') && (event.message.match(ValidConfirmRe))) {
                kiwi.state.$emit('mediaviewer.hide')
            }

        if ((event.nick == 'NickServ') && (event.message.match(BadPwdRe))) {
                var el = document.getElementById("validate")
                el.innerHTML = BPText ;
            }


        if ((event.nick == 'NickServ') && (event.message.match(BadEmailRe))) {
                var el = document.getElementById("validate")
                el.innerHTML = event.message ;
            }


        if ((event.nick == 'NickServ') && (event.message.match(RegDelayRe))) {
                var el = document.getElementById("validate");
                el.innerHTML = event.message ;
                setTimeout(function() {
                    kiwi.state.$emit('mediaviewer.hide');
                }, 2000);
            }
        if ((event.nick == 'NickServ') && (event.message.match(ValidPwdRe))) {
                var el = document.getElementById("validate");
                el.innerHTML = event.message ;
                setTimeout(function() {
                    kiwi.state.$emit('mediaviewer.hide');
                }, 2000);
            }

        if ((event.nick == 'NickServ') && (event.message.match(AlreadyIdRe))) {
                var el = document.getElementById("validate");
                el.innerHTML = event.message ;
                setTimeout(function() {
                    kiwi.state.$emit('mediaviewer.hide');
                }, 2000);
            }
         });

    kiwi.on('input.command.nick', function(event) {
        kiwi.state.$emit('mediaviewer.hide')
    });

});