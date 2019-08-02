document.addEventListener('DOMContentLoaded', (event) => {
    const baseUrl = `http://localhost:3000/`
    const playersURL = `players`
    const matchesUrl = `matches`
    const playerMatchesUrl = 'player_matches'

    const createPlayerForm = document.querySelector('#create-player')
    const signUpButton = document.querySelector('#sign-up')
    const logInButton = document.querySelector('#login-button')
    const requestMatchButton = document.querySelector('#request')
    const logInForm = document.querySelector('#log-in-form')
    const requestMatchForm = document.querySelector('#request-match-form')
    const greetingBox = document.querySelector('header div.greeting')
    const requestedMatchesContainer = document.querySelector('#requested-matches')
    const currentLogInMatches = document.querySelector('.my_matches')
    
    fetch(baseUrl+matchesUrl)
        .then(parseJson)
        .then(json => {
            getRequestedMatches(json)
        })

        
        
    createPlayerForm.addEventListener('submit', event => {
        event.preventDefault()
        
        const formData = new FormData(createPlayerForm)
        console.log(formData.get('email'))
        fetch(baseUrl+playersURL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: formData.get('email'),
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                birth_date: formData.get('birth_date'),
                player_ability_rating: formData.get('player_ability_rating'),
                sex: formData.get('sex')}
                )}
                ).then(parseJson)
                .then(json => {
                    console.log(json.data.id)
                    greetingBox.innerText = `Hello ${json.data.attributes.first_name}!`
                    greetingBox.dataset.playerId = json.data.id
                })

                createPlayerForm.reset()
                createPlayerForm.classList.toggle('open')
            })
              

    logInForm.addEventListener('submit', event => {
        event.preventDefault()
        
        const formData = new FormData(logInForm)
        fetch(baseUrl+playersURL)
            .then(parseJson)
            .then(json => getPlayer(json, formData)) 
                logInForm.reset()
                logInForm.classList.toggle('open')
    })

    requestMatchForm.addEventListener('submit', event =>{
        event.preventDefault()
        const formData = new FormData(requestMatchForm)
        const playerId = greetingBox.dataset.playerId
        fetch(baseUrl+matchesUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    score: formData.get('score'),
                    completed: formData.get('completed'),
                    discription: formData.get('discription'),
                    match_time: formData.get('match_time'),
                    player_id: playerId,
                })
            })
            .then(parseJson)
            .then(json => {
                fetch(baseUrl+playerMatchesUrl, {
                    method: 'POST',
                    headers: {'contenet-Type': 'applicaiton/json'},
                    body: JSON.stringify({
                        match_id: json.id,
                        player_id:  parseInt(playerId)
                        })
                })
            })
        requestMatchForm.reset()
        requestMatchForm.classList.toggle('open')
    })

    signUpButton.addEventListener('click', event => {
        logInForm.classList.remove('open')
        requestMatchForm.classList.remove('open')
        createPlayerForm.classList.toggle('open')
    })

    logInButton.addEventListener('click', event => {
        createPlayerForm.classList.remove('open')
        requestMatchForm.classList.remove('open')
        logInForm.classList.toggle('open')
    })

    requestMatchButton.addEventListener('click', event => {
        createPlayerForm.classList.remove('open')
        logInForm.classList.remove('open')
        requestMatchForm.classList.toggle('open')
    })

    function parseJson(response){
            return response.json()
        }

    function getPlayer(json, formData){
        const playerLogin = json.data.filter(player =>{
            return player.attributes.email.replace(' ', '') == formData.get('email').replace(' ', '')
          })[0]
          console.log(playerLogin)
          greetingBox.innerText = `Hello ${playerLogin.attributes.first_name}!`
          greetingBox.dataset.playerId = playerLogin.id
          
          getUserMatches(playerLogin)
        
    }
    
    function getRequestedMatches(json){
            const requestedMatchArray = json.data.filter(match => {
                return match.attributes.players.length == 1})

            requestedMatchArray.forEach(request => {
                console.log(request)
                const aMatchToJoin = document.createElement('div')
                const joinButton = document.createElement('button')
                joinButton.innerText = "Join"
                joinButton.class = "join"
                console.log(joinButton.class)
                joinButton.addEventListener('click', event => {
                    console.log(event.target.parentNode.dataset.matchId)
                    console.log(greetingBox.dataset.playerId)
                    fetch(baseUrl+playerMatchesUrl, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            match_id: parseInt(event.target.parentNode.dataset.matchId),
                            player_id: parseInt(greetingBox.dataset.playerId)
                            })
                        }
                        )
                    event.target.parentNode.remove()
                })
                aMatchToJoin.innerText = ` ${request.attributes.players[0].first_name} - ${request.attributes.discription} `
                aMatchToJoin.prepend(joinButton)
                aMatchToJoin.dataset.matchId = request.id
                requestedMatchesContainer.append(aMatchToJoin)        
           })

}

function getUserMatches(playerLogin){
    return playerLogin.attributes.matches.forEach(match => {
            console.log(match)
            const playerMatch = document.createElement('div')
            const deleteButton = document.createElement('button')
            const updateButton = document.createElement('button')
            deleteButton.innerText = "Delete"
            deleteButton.addEventListener('click', event =>
                event.target.parentNode.remove()
                // fetch(baseUrl+playerMatch)
            )
            updateButton.innerText = "Update"
            playerMatch.innerText = `${match.discription}`
            playerMatch.dataset.matchId = match.id
            playerMatch.dataset.playerId = playerLogin.id
            playerMatch.prepend(deleteButton, updateButton)
            currentLogInMatches.append(playerMatch)
    })
}

 

})