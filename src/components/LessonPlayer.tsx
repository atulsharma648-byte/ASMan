import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  Languages, 
  Lightbulb, 
  CheckCircle,
  Circle,
  RefreshCw,
  Globe
} from 'lucide-react';
import { LessonContent, GlobalStyle, ClassLevel, Subject } from '../types';
import { GlobalStyleSelector } from './GlobalStyleSelector';
import { ASmanCharacter } from './ASmanCharacter';

interface LessonPlayerProps {
  lessonContent: LessonContent;
  classLevel: ClassLevel;
  subject: Subject;
  topic: string;
  globalStyle: GlobalStyle;
  onBack: () => void;
  onStyleChange: (style: GlobalStyle) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lessonContent,
  classLevel,
  subject,
  topic,
  globalStyle,
  onBack,
  onStyleChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showStyleSelector, setShowStyleSelector] = useState(false);

  const classNumber = classLevel.replace('class-', '');
  const currentQuestion = lessonContent.questions[currentQuestionIndex];

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < lessonContent.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getTranslatedText = (text: string): string => {
    if (!isHindi) return text;
    
    // Simple translation logic using the hindiTranslation map
    let translatedText = text;
    Object.entries(lessonContent.hindiTranslation).forEach(([english, hindi]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, hindi);
    });
    return translatedText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-md">
              <span className="text-sm text-gray-600">Class {classNumber} • {subject} • {topic}</span>
            </div>
          </div>
        </div>

        {/* Teacher Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ASmanCharacter size="medium" animate={isPlaying} />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Teacher Controls</h3>
                <p className="text-gray-600">Control your lesson presentation</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-3 rounded-full ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>

              {/* Language Toggle */}
              <motion.button
                onClick={() => setIsHindi(!isHindi)}
                className={`p-3 rounded-full ${isHindi ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Languages className="w-6 h-6" />
              </motion.button>

              {/* Global Style Toggle */}
              <motion.button
                onClick={() => setShowStyleSelector(!showStyleSelector)}
                className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-6 mt-4 text-sm">
            <div className={`flex items-center space-x-2 ${isPlaying ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span>{isPlaying ? 'Lesson Active' : 'Lesson Paused'}</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <Languages className="w-4 h-4" />
              <span>{isHindi ? 'Hindi Mode' : 'English Mode'}</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <Globe className="w-4 h-4" />
              <span>{globalStyle.charAt(0).toUpperCase() + globalStyle.slice(1)} Style</span>
            </div>
          </div>
        </motion.div>

        {/* Global Style Selector */}
        <AnimatePresence>
          {showStyleSelector && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <GlobalStyleSelector
                selectedStyle={globalStyle}
                onSelectStyle={(style) => {
                  onStyleChange(style);
                  setShowStyleSelector(false);
                }}
                showTitle={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Lesson Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Explanation */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h3 className="text-2xl font-bold text-gray-900">Lesson Content</h3>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {getTranslatedText(lessonContent.explanation)}
              </p>
            </div>

            {/* Global Method */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">
                Teaching Method: {globalStyle.charAt(0).toUpperCase() + globalStyle.slice(1)}
              </h4>
              <p className="text-blue-800 text-sm">
                {getTranslatedText(lessonContent.globalMethod)}
              </p>
            </div>

            {/* Activity */}
            <div className="mt-6 p-4 bg-green-50 rounded-xl">
              <h4 className="font-semibold text-green-900 mb-2">
                🎨 Hands-on Activity
              </h4>
              <p className="text-green-800 text-sm">
                {getTranslatedText(lessonContent.activity)}
              </p>
            </div>
          </motion.div>

          {/* Interactive Questions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Interactive Questions
              </h3>
              <div className="text-sm text-gray-500">
                {currentQuestionIndex + 1} of {lessonContent.questions.length}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Question */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">
                    Question {currentQuestionIndex + 1}
                  </h4>
                  <p className="text-blue-800">
                    {getTranslatedText(currentQuestion.question)}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === index;
                    const isCorrect = index === currentQuestion.correct;
                    const showResult = selectedAnswers[currentQuestionIndex] !== undefined;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          showResult
                            ? isCorrect
                              ? 'border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        whileHover={!showResult ? { scale: 1.02 } : {}}
                        whileTap={!showResult ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {showResult ? (
                              isCorrect ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : isSelected ? (
                                <Circle className="w-6 h-6 text-red-600" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-400" />
                              )
                            ) : (
                              <Circle className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                            )}
                          </div>
                          <span className={`${
                            showResult && isCorrect
                              ? 'text-green-900 font-medium'
                              : showResult && isSelected
                              ? 'text-red-900'
                              : 'text-gray-900'
                          }`}>
                            {getTranslatedText(option)}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-2">
                    {lessonContent.questions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentQuestionIndex
                            ? 'bg-blue-600'
                            : selectedAnswers[index] !== undefined
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === lessonContent.questions.length - 1}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Hindi Translations Panel */}
        {Object.keys(lessonContent.hindiTranslation).length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Languages className="w-6 h-6 text-orange-500 mr-2" />
              Key Terms Translation
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(lessonContent.hindiTranslation).map(([english, hindi]) => (
                <div key={english} className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="font-medium text-gray-900">{english}</div>
                  <div className="text-orange-600 font-medium text-lg">{hindi}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};