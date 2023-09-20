import axios from "axios";

function validField(res, requiredFields) {
  if (
    requiredFields.some((field) => !field.trim() || typeof field !== "string")
  ) {
    const error = new Error("Existen campos vacios o inválidos");
    return res.status(400).json({ msg: error.message });
  }
}

function validName(res, name) {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s'_-]+$/;

  if (!nameRegex.test(name)) {
    const error = new Error(
      "Nombre inválido. No debe contener caracteres especiales."
    );
    return res.status(400).json({ msg: error.message });
  }
}

function validEmail(res, email) {
  const emailRegex =
    /^[a-zA-Z0-9._%+-]*[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]*[a-zA-Z][a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    console.log("error");
    const error = new Error("Email no valido");
    return res.status(400).json({ msg: error.message });
  }
}

function validPassword(res, password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+\\/.-])[A-Za-z\d@$!%*?&+\\/.-]{8,}$/;

  if (!passwordRegex.test(password)) {
    const error = new Error("Error en la contraseña");
    return res.status(400).json({ msg: error.message });
  }
}

async function validCaptcha(res, captcha) {
  if (captcha) {
    const captchaVerified = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`
    );

    if (!captchaVerified.data.success) {
      const error = new Error("Captcha Incorrecto");
      return res.status(404).json({ msg: error.message, emailR: email });
    }
  } else {
    return res.status(404).json({ msg: "El captcha es necesario" });
  }
}

export { validField, validName, validEmail, validPassword, validCaptcha };
