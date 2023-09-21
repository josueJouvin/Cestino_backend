import Seller from "../models/Seller.js";
import generateJWT from "../helpers/generateJWT.js";
import generateId from "../helpers/generateId.js";
import emailRegister from "../helpers/emailRegister.js";
import emailForgetPassword from "../helpers/emailForgetPassword.js";
import {
  validCaptcha,
  validEmail,
  validField,
  validName,
  validPassword,
} from "../utils/validFields.js";

const register = async (req, res) => {
  const { email, name, password, repeatPassword, captcha } = req.body;
  const requiredFields = [name, email, password, repeatPassword, captcha];

  const isUser = await Seller.findOne({ email });
  if (isUser) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message, emailR: isUser.email });
  }

  if (!validField(res, requiredFields) || !validName(res, name) || !validEmail(res, email) || !validPassword(res, password))return;
  
  await validCaptcha(res, captcha)

  if (password !== repeatPassword) {
    const error = new Error("Los Password no son iguales");
    return res.status(400).json({ msg: error.message });
  }

  try {
    const seller = new Seller(req.body);
    const saveSeller = await seller.save();
    emailRegister({ email, name, token: saveSeller.token });
    res.json(saveSeller);
  } catch (error) {
    return res.status(500).json({ msg: "Error al registrar usuario" });
  }
};

const profile = (req, res) => {
  const { seller } = req;
  res.json(seller);
};

const confirmation = async (req, res) => {
  const { token } = req.params;

  const confirmUser = await Seller.findOne({ token });
  if (!confirmUser) {
    const error = new Error("Token no valido");
    return res.status(404).json({ msg: error.message });
  }

  try {
    confirmUser.token = null;
    confirmUser.confirmed = true;
    await confirmUser.save();
    res.json({ msg: "usuario confirmado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al confirmar el usuario" });
  }
};

//login
const authenticate = async (req, res) => {
  const { email, password, captcha } = req.body;
  const requiredFields = [email, password, captcha];

  const user = await Seller.findOne({ email });
  if (!user) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message, emailR: email });
  }

  if (!validField(res, requiredFields) ||!validEmail(res, email) ||!validPassword(res, password)) return;

  await validCaptcha(res, captcha);

  //checking if the user is confirmed
  if (!user.confirmed) {
    const error = new Error("Tu cuenta no ha sido confirmada, revisa tu email");
    return res
      .status(403)
      .json({ msg: error.message, confirmed: user.confirmed, emailR: email });
  }
  //Check password
  if (await user.checkPassword(password)) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateJWT(user.id),
    });
  } else {
    const error = new Error("Password o Correo incorrecto");
    return res
      .status(403)
      .json({ msg: error.message, valid: password, emailR: email });
  }
};

const lostPassword = async (req, res) => {
  const { email } = req.body;
  const requiredFields = [email];

  const sellerExists = await Seller.findOne({ email });
  if (!sellerExists) {
    const error = new Error("El usuario no existe");
    return res.status(400).json({ msg: error.message, emailR: email });
  }

  if (!validField(res, requiredFields) || !validEmail(res, email)) return;

  if (!sellerExists.confirmed) {
    return res
      .status(409)
      .json({
        msg: "Su cuenta aun no ha sido confirmada. Revise su correo",
        confirmed: sellerExists.confirmed,
        emailR: email,
      });
  }

  if (sellerExists.token && sellerExists.confirmed) {
    return res
      .status(409)
      .json({
        msg: "Ya se ha enviado un correo de recuperación. Por favor, revise su correo.",
        emailR: email,
        confirmed: sellerExists.confirmed,
      });
  }

  try {
    sellerExists.token = generateId();
    sellerExists.tokenValidated = false;
    await sellerExists.save();
    emailForgetPassword({
      email,
      name: sellerExists.name,
      token: sellerExists.token,
    });
    res.json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error en recuperar password" });
  }
};

const checkToken = async (req, res) => {
  const { token } = req.params;

  const validToken = await Seller.findOne({ token });
  if (validToken) {
    res.json({ msg: "Token valido y el usuario existe" });
  } else {
    const error = new Error("token no valido");
    return res.status(400).json({ msg: error.message });
  }
};

const newPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const requiredFields = [password];

  if (!validField(res, requiredFields)) return;

  if (!passwordRegex.test(password)) {
    const error = new Error(
      "Error en la contraseña. La contraseña debe contener al menos 8 caracteres, una letra minúscula, una letra mayúscula, un número y un carácter especial (@$!%*?&)."
    );
    return res.status(400).json({ msg: error.message });
  }

  const seller = await Seller.findOne({ token });
  if (!seller) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  try {
    seller.token = null;
    seller.password = password;
    await seller.save();
    res.json({ msg: "password modificado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const updateProfile = async (req, res) => {
  const { email } = req.body;
  const requiredFields = [email];

  const seller = await Seller.findById(req.params.id);
  if (!seller) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }
  if (!validField(res, requiredFields) ||!validEmail(res, email)) return

  if (seller.email !== req.body.email) {
    const existEmail = await Seller.findOne({ email });
    if (existEmail) {
      const error = new Error("Este email ya esta en uso");
      return res.status(400).json({ msg: error.message });
    }
  }
  try {
    seller.name = req.body.name || seller.name;
    seller.companyName = req.body.companyName || seller.companyName;
    seller.phone = req.body.phone !== undefined ? req.body.phone : seller.phone;
    seller.email = req.body.email || seller.email;

    const updateSeller = await seller.save();
    res.json(updateSeller);
  } catch (error) {
    console.log(error);
  }
};

const updatePassword = async (req, res) => {
  const { _id } = req.seller;
  const { pwd_current, pwd_new } = req.body;

  const seller = await Seller.findById({ _id });
  if (!seller) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  const requiredFields = [pwd_new];
  if (!validField(res, requiredFields) || !validPassword(res, pwd_new)) return;

  if (await seller.checkPassword(pwd_current)) {
    seller.password = pwd_new;
    await seller.save();
    res.json({ msg: "Password Almacenado Correctamente" });
  } else {
    const error = new Error("Password Actual Incorrecto");
    return res.status(400).json({ msg: error.message });
  }
};
export {
  register,
  profile,
  confirmation,
  authenticate,
  lostPassword,
  checkToken,
  newPassword,
  updateProfile,
  updatePassword,
};
