import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js"
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) =>{

console.log(req.body);
    const { email, nombre } = req.body

    //prevenir usuarios duplicados
    const existeUsuario =  await Veterinario.findOne({email})

    if (existeUsuario) {
        const error = new Error ("Usuario ya registrado");
        return res.status(400).json({msg: error.message})
    }
    try {
        //guardar un nuveo vet.
        const veterinario = new Veterinario(req.body)
        const veterinarioGuardado = await veterinario.save()

        //enviar el email
        emailRegistro({
            email, nombre, token: veterinarioGuardado.token
        })

        res.json(veterinarioGuardado)
    } catch (error) {
        console.log(error);
    }
    
}

const perfil = (req, res) =>{
    const {veterinario}= req
    res.json(veterinario)
}

const confirmar = async (req, res) =>{
    const { token } =req.params

    const usuarioConfirmar = await Veterinario.findOne({token})
    if (!usuarioConfirmar) {
        const error = new Error("Token no valido")
        return res.status(404).json({msg: error.message})
    }
    try {
        usuarioConfirmar.token = null
        usuarioConfirmar.confirmado = true
        await usuarioConfirmar.save()
        res.json({msg: "Usuario confirmado correctamente"}) 
    } catch (error) {
        console.log(error);
    }
}

const autenticar = async(req, res) => {
    const { email, password } = req.body
    const usuario = await Veterinario.findOne({email})
    if (!usuario) {
        const error = new Error("El usuario no existe")
        return res.status(404).json({msg: error.message})
    }
//comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada")
        return res.status(403).json({msg: error.message})
}

//Revisar el password
    if (await usuario.comprobarPassword(password)) {
        //autenticar con json web token
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id)
        })
    } else {
        const error = new Error("El password es incorrecto")
        return res.status(403).json({ msg: error.message })
    }
}

const olvidePassword = async (req, res) =>{
    const { email } = req.body
    const existeVeterinario = await Veterinario.findOne({email})
    if (!existeVeterinario) {
        const error = new Error("EL usuario no existe")
        return res.status(400).json({msg: error.message})
    }
    try {
        existeVeterinario.token = generarId()
        await existeVeterinario.save()

        //enviar email con contraseña nueva
        emailOlvidePassword({
            email, 
            nombre: existeVeterinario.nombre,
            token:existeVeterinario.token
        })

        res.json({msg: "Hemos enviado un email con las instrucciones."})
    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) =>{
    const { token } = req.params
    const tokenValido = await Veterinario.findOne({token})
    if(tokenValido){
        res.json({msg: "Token valido y el usuario existe"})
    }else{
        const error = new Error('Token no valido')
        return res.status(400).json({msg: error.message})
    }
}

const nuevoPassword = async (req, res) =>{
    const { token } = req.params
    const { password } = req.body
    const veterinario = await Veterinario.findOne({token})
    if(!veterinario){
        const error = new Error('Hubo un error')
        return res.status(400).json({msg: error.message})
    }
    try {
        veterinario.token = null
        veterinario.password = password
        await veterinario.save()
        res.json({msg: "Password modificado correctamente."})
    } catch (error) {
        console.log(error);
    }
}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id)
    if (!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({
            msg: error.message
        })
    }
    const { email } = req.body
    if (veterinario.email !== req.body.email) {
        const existeEmail = await Veterinario.findOne({email})
            if (existeEmail) {
                const error = new Error('Ese email ya esta en uso')
                return res.status(400).json({
                    msg: error.message
                })
            }
        
    }

    try {
        veterinario.nombre =req.body.nombre
        veterinario.email =req.body.email
        veterinario.web =req.body.web
        veterinario.telefono =req.body.telefono

        const veterinarioActualizado = await veterinario.save()
        res.json(veterinarioActualizado)
    } catch (error) {
        console.log(error);
    }
}

const actualizarPassword = async (req, res) =>{
    //leer los datos
    const { id }= req.veterinario
    const { pwd_actual, pwd_nuevo }= req.body
    //comprobar que el veterinario exista
    const veterinario = await Veterinario.findById(id)
    if (!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({
            msg: error.message
        })
    }
    //comprobar su contraseña
    if (await veterinario.comprobarPassword(pwd_actual)){
      //Almacenar su nueva contraseña 
       veterinario.password = pwd_nuevo
       await veterinario.save()
       res.json({msg: 'Contraseña actualizada correctamente'})
    } else {
        const error = new Error('La contraseña actual es incorrecta.')
        return res.status(400).json({
            msg: error.message
        })
    }

    
}

export { registrar, perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword, actualizarPerfil, actualizarPassword}
