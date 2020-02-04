const getAgentLocale = () => {
    let lang = localStorage.getItem("_locale") || navigator.language || navigator.userLanguage || "ru";

    //TODO care to adjust for likes of en-US, en-UK etc

    return lang.slice(0,2);
}


const AgentUtils = {
    getAgentLocale
}

export default AgentUtils;