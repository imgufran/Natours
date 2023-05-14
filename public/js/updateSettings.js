import axios from "axios";
import { showAlert } from "./alerts";

// type -> either "password" or "data"
export const updateSettings = async (data, type) => {
  console.log("inside update settings");
  console.log(data);
  // api/v1/users/updateMyPassword
  try {
    const url = type === "password" ? "api/v1/users/updateMyPassword" : "api/v1/users/updateMe"
    const res = await axios({
      method: "PATCH",
      url,
      data
    });

    console.log(res.data);

    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully`);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
}