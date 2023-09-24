import nodemailer from "nodemailer"

const emailRegister = async ({email, name, token}) =>{
  
      const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const info = await transport.sendMail({
        from: "cestinoinfo27@gmail.com",
        to: email,
        subject: "Comprueba tu cuenta en Cestino",
        text: "Comprueba tu cuenta en Cestino",
        html: `<p>Hola: ${name}, comprueba tu cuenta en Cestino.</p>
               <p>Tu cuenta ya esta lista, solo debes comprobarla en el siguente enlace: <a href="${process.env.FRONTEND_URL}/auth/confirmar/${token}">Comprobar Cuenta</a></p>
               
               <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
      })

      console.log("enviado: %s", info)

}

export default emailRegister