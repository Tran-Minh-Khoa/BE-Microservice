const QuizList = require('../models/quizz')
const textToSpeech = require('@google-cloud/text-to-speech');
const mp3Duration = require('mp3-duration');


const tempOutro = "And with that as the last question, today quiz has officially come to a close. Congratulations to all participants! We are thrilled to have had you all join us for this engaging challenge. Here are today winners."

const client = new textToSpeech.TextToSpeechClient();
const generateAudioScrip = async (text) => {
  const request = {
    input: { text: text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: 'en-US', name: "en-US-Standard-H", ssmlGender: 'FEMALE' },
    // select the type of audio encoding
    audioConfig: { audioEncoding: 'MP3' },
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file



  // Calculate the size of the binary audio content
  const base64AudioContent = response.audioContent;
  const binaryAudioContent = Buffer.from(base64AudioContent, 'base64');



  const duration = await mp3Duration(binaryAudioContent, (err, duration) => {
    if (err) {
      console.error('Error getting duration:', err.message);
      return 'Error getting duration:' + err.message
    }
    // console.log('lalaa')
    return duration
  });
  //console.log('Estimated duration (seconds):', duration);

  return { audioContent: base64AudioContent.toString('base64'), duration: duration }
}

exports.addQuizList = async (quizListData) => {
  try {
    // Tạo một đối tượng mới của QuizList
    const intro = await generateAudioScrip(quizListData.scriptIntro)
    const outro = await generateAudioScrip(tempOutro)

    const newQuizList = new QuizList({
      title: quizListData.title,
      description: quizListData.description,
      quizzes: [],
      scriptIntro: {
        text: quizListData.scriptIntro,
        audioData: await intro.audioContent,
        duration: intro.duration,
      },
      scriptOutro: {
        text: tempOutro,
        audioData: await outro.audioContent,
        duration: outro.duration,
      }
    });
    //console.log(quizListData.quizzes)
    // Xử lý từng câu hỏi trong danh sách
    var count = 1;
    for (const questionData of quizListData.quizzes) {
      const preQuestion = await generateAudioScrip(questionData.scriptPreQuestion)
      const question = await generateAudioScrip(`Question number ${count} ` + questionData.scriptQuestion)
      const answer = await generateAudioScrip(questionData.scriptAnswer)

      const newQuestion = {
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,

        scriptPreQuestion: {
          text: questionData.scriptPreQuestion,
          audioData: await preQuestion.audioContent,
          duration: preQuestion.duration,
        },

        scriptQuestion: {
          text: `Question number ${count} ` + questionData.scriptQuestion,
          audioData: await question.audioContent,
          duration: question.duration,
        },

        scriptAnswer: {
          text: questionData.scriptAnswer,
          audioData: await answer.audioContent,
          duration: answer.duration,
        },
      };

      newQuizList.quizzes.push(newQuestion);

      count += 1;
    }

    // Lưu vào cơ sở dữ liệu
    await newQuizList.save();
    return newQuizList._id;
  }
  catch (error) {
    console.log(error);
    throw new Error('Error adding quiz list: ' + error.message);
  }
};


exports.getQuizListById = async (id) => {
  try {
    const quizList = await QuizList.findById(id).exec();

    if (quizList) {
      return quizList;
    } else {
      throw new Error('Quiz list not found');
    }
  } catch (error) {
    throw new Error('Error retrieving quiz list: ' + error.message);
  }
};
exports.updateQuizList = async (id, title, description, scriptIntro, quizzes) => {
  try {
    // Tạo audio mới cho phần scriptIntro và scriptOutro
    const intro = await generateAudioScrip(scriptIntro);
    const outro = await generateAudioScrip(tempOutro); // Bạn có thể thay đổi `tempOutro` theo yêu cầu

    // Tìm quiz list theo id
    const quizList = await QuizList.findById(id);

    if (!quizList) {
      throw new Error('Quiz list not found');
    }

    // Cập nhật thông tin title, description, scriptIntro và scriptOutro
    quizList.title = title || quizList.title;
    quizList.description = description || quizList.description;

    quizList.scriptIntro = {
      text: scriptIntro,
      audioData: await intro.audioContent,
      duration: intro.duration,
    };

    quizList.scriptOutro = {
      text: tempOutro, // Sử dụng scriptOutro mới nếu cần
      audioData: await outro.audioContent,
      duration: outro.duration,
    };

    // Nếu có danh sách quizzes mới, cập nhật từng câu hỏi
    if (quizzes && quizzes.length > 0) {
      quizList.quizzes = []; // Xóa tất cả câu hỏi cũ
      let count = 1;

      for (const questionData of quizzes) {
        const preQuestion = await generateAudioScrip(questionData.scriptPreQuestion);
        const question = await generateAudioScrip(`Question number ${count} ` + questionData.scriptQuestion);
        const answer = await generateAudioScrip(questionData.scriptAnswer);

        const updatedQuestion = {
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,

          scriptPreQuestion: {
            text: questionData.scriptPreQuestion,
            audioData: await preQuestion.audioContent,
            duration: preQuestion.duration,
          },

          scriptQuestion: {
            text: `Question number ${count} ` + questionData.scriptQuestion,
            audioData: await question.audioContent,
            duration: question.duration,
          },

          scriptAnswer: {
            text: questionData.scriptAnswer,
            audioData: await answer.audioContent,
            duration: answer.duration,
          },
        };

        quizList.quizzes.push(updatedQuestion);
        count += 1;
      }
    }

    // Lưu các thay đổi vào cơ sở dữ liệu
    await quizList.save();
    return quizList._id;
  } catch (error) {
    console.error('Error updating quiz list:', error);
    throw new Error('Error updating quiz list: ' + error.message);
  }
};
