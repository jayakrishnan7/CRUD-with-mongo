import {connect} from 'mongoose'

function connects () {
    
    return connect('mongodb+srv://jayakrishnan:VROLYJriRQDoDhHj@crud.xfz2ixo.mongodb.net/test')
    .then(() => {
        console.log('DB connected successfully');
        
    })
    .catch((error: any) => {
        console.log(error);
        
    })
}


export default connects;