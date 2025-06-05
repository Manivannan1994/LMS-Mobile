import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export default i18n.use(initReactI18next).init({
  lng: "en",
  debug: true,
  fallbackLng: "en",
  resources: {
   en : {
      translate: require("./ENG_IND_COL.json"),
    },
    //es: {
    //   authentication: require("./lang/es/authentication"),
    // }, 
  },
});
