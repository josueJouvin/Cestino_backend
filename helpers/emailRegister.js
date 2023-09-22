import nodemailer from "nodemailer"
import { Resend } from 'resend';

const emailRegister = async ({email, name, token}) =>{
    /*const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const info = await transport.sendMail({
        from: "Cestino - Administra tus productos",
        to: email,
        subject: "Comprueba tu cuenta en Cestino",
        text: "Comprueba tu cuenta en Cestino",
        html: `<p>Hola: ${name}, comprueba tu cuenta en Cestino.</p>
               <p>Tu cuenta ya esta lista, solo debes comprobarla en el siguente enlace: <a href="${process.env.FRONTEND_URL}/auth/confirmar/${token}">Comprobar Cuenta</a></p>
               
               <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
      })

      console.log("enviado: %s", info.messageId)*/


      const resend = new Resend(process.env.EMAIL_API_KEY);

      try {
        const data = await resend.emails.send({
          from: 'Cestino - Administra tus productos <cestino@cestino.com>',
          to: email,
          subject: 'Comprueba tu cuenta en Cestino',
          text: "Comprueba tu cuenta en Cestino",
          html: `<p>Hola: ${name}, comprueba tu cuenta en Cestino.</p>
                <p>Tu cuenta ya esta lista, solo debes comprobarla en el siguente enlace: <a href="${process.env.FRONTEND_URL}/auth/confirmar/${token}">Comprobar Cuenta</a></p>
          
                <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
                `
        });
    
        console.log(data);
      } catch (error) {
        console.error(error);
      }

}

export default emailRegister