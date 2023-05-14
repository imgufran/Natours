import axios from "axios";
import { showAlert } from "./alerts";

// Original
// const stripe = Stripe(
//   "pk_test_51N7EmLSAMezR8LZnHIT3gaM8l0JRf3eqXwPuzxmE4GUI0xaKEZK80foMHRyd9yyGpe7BdbWaoSkA5zr8NmagjbgS00ccIja8he"
// );

const Stripe = require("stripe");
const stripe = Stripe(
  "pk_test_51N7EmLSAMezR8LZnHIT3gaM8l0JRf3eqXwPuzxmE4GUI0xaKEZK80foMHRyd9yyGpe7BdbWaoSkA5zr8NmagjbgS00ccIja8he"
);

export const bookTour = async (tourId) => {
  try {
    // 1.) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // 2.) Create checkout form + charge the credit card
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id
    // });
    window.location.replace(session.data.session.url);

  } catch (error) {
    console.log(error);
    showAlert("error", error);
  }
};
