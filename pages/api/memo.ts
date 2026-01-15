// NEXTAPI 通信例 = async (e:React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setErrors("")
//     try {
//       await nextApi("/auth/sign-in", {
//         method: "POST",
//         body: form,
//       })
//       router.replace('/')
//     }
//     catch (e){
//       if (e instanceof Error){
//         const errorMessage= JSON.parse(e.message)
//         setErrors(errorMessage.message)
//       }
//       else {
//         setErrors("ログイン失敗しました。")
//       }
//     }
//   }


// front.tsx側