// Chỉ được nạp thay các gói đề cương ở mode sandbox. Không có nội dung đề thật.
for (const grade of [8,9,10]) {
  window[`EXAM_DATA_G${grade}`] = {
    practiceQuestions:Array.from({length:grade===10?19:28},(_,i)=>({id:i+1,num:i+1,question:`Câu ôn tập giả ${i+1}: chọn phương án A để thử.`,options:['Phương án thử A','Phương án thử B','Phương án thử C','Phương án thử D'],correctAnswer:0,points:0.25,explanation:'Đáp án giả để kiểm tra luồng ôn tập.'})),
    practiceTfQuestions:grade===10?Array.from({length:3},(_,i)=>({num:i+1,context:`Tình huống giả ${i+1}.`,points:1,subQuestions:['a','b','c','d'].map((letter,j)=>({letter,text:`Nhận định thử ${letter}.`,correctAnswer:j%2===0}))})):[],
    practiceEssayQuestions:Array.from({length:3},(_,i)=>({num:i+1,context:`Tình huống tự luận giả ${i+1}.`,subItems:[{letter:'a',text:'Mô tả thao tác em đã thử.'},{letter:'b',text:'Nêu kết quả mong đợi.'}],modelAnswer:'Hướng dẫn giả: đối chiếu thao tác và kết quả.'}))
  };
}
