/*eslint-disable*/

import axios from "axios"
import { showAlert } from "./alerts"

const stripe = Stripe("pk_test_51PywXCBxOrjXaSbKthLG6P7HZ6Qtrct7sh0gucIy6r12DoOV6kimmJ8h0uaGBPHg24VSZnyq83MLf03YWueAoqxT00FjUfYwVr");

export const bookTour = async tourId =>{
    
    try{
        // 1) Get checkout session from api
        const session = await axios(`/api/v1/booking/checkout-session/${tourId}`)
     console.log(session)
        // 2) Create checkout from + charge credit card
        await stripe.redirectToCheckout({ sessionId: session.data.session.id })
       
    }catch(err){
        console.log(err)
        showAlert('error',err)
    }
    
}