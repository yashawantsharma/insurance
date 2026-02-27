import axios from 'axios';
import React from 'react'

const Police = () => {
    const [input, setInput] = React.useState({
        fullName: "",
        endDate:"",
        amount:"",
        totalAmount:"",
        profitAmount:"",
    })


    const handlsubmit = async(e) => {
        e.preventDefault();
       try {
        const res = await axios.post("http://localhost:5050/police/", input);
        alert("Data submitted successfully!");
        console.log(res.data);
    } catch (error) {
        console.error("Error submitting form:", error);
    }
}
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100   '>
    <form  onSubmit={handlsubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md mx-auto mt-10">
        <label htmlFor="">fullName :
            <input type="text" value={input.fullName} onChange={(e) => setInput({...input, fullName: e.target.value})} className='w-full border'/>
        </label>

        <label htmlFor="">endDate :
            <input type="date" value={input.endDate} onChange={(e) => setInput({...input, endDate: e.target.value})} className='w-full border' />
        </label>

        <label htmlFor="">Amount :
            <input type="number" value={input.amount} onChange={(e) => setInput({...input, amount: e.target.value})} className='w-full border'/>
        </label>

        <label htmlFor="">Total Amount :
            <input type="number" value={input.totalAmount} onChange={(e) => setInput({...input, totalAmount: e.target.value})} className='w-full border'/>
        </label>

        <label htmlFor="">Profit Amount :
            <input type="number" value={input.profitAmount} onChange={(e) => setInput({...input, profitAmount: e.target.value})} className='w-full border'/>
        </label>

        <button type='submit' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded items-center'>Submit</button>
    </form>  
    </div>
  )
}

export default Police
