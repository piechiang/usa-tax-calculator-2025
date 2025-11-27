import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle, Star, Clock, Users, Award, ExternalLink } from 'lucide-react';
import { toast } from '../../utils/toast';

interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'deductions' | 'credits' | 'business' | 'retirement' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  completed?: boolean;
  rating: number;
  enrolledCount: number;
  topics: string[];
  resources?: {
    articles: string[];
    videos: string[];
    calculators: string[];
    forms: string[];
  };
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  };
}

export const TaxEducationCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const educationModules: EducationModule[] = [
    {
      id: 'tax-basics-101',
      title: 'Tax Basics 101: Understanding Your Tax Return',
      description: 'Learn the fundamentals of how taxes work, including income types, deductions, and credits.',
      category: 'basics',
      difficulty: 'beginner',
      estimatedTime: '30 minutes',
      rating: 4.8,
      enrolledCount: 15420,
      topics: ['Gross Income', 'Adjusted Gross Income', 'Taxable Income', 'Tax Brackets', 'Filing Status'],
      resources: {
        articles: ['Understanding Form 1040', 'Types of Income', 'Filing Status Guide'],
        videos: ['Tax Return Walkthrough', 'Income vs Deductions'],
        calculators: ['Tax Bracket Calculator', 'AGI Calculator'],
        forms: ['Form 1040', 'Schedule 1']
      },
      quiz: {
        questions: [
          {
            question: 'What is Adjusted Gross Income (AGI)?',
            options: [
              'Your total income before any deductions',
              'Your income after standard/itemized deductions',
              'Your income after certain adjustments but before deductions',
              'Your final tax liability'
            ],
            correctAnswer: 2,
            explanation: 'AGI is your total income after certain adjustments (like retirement contributions) but before standard or itemized deductions.'
          }
        ]
      }
    },
    {
      id: 'deductions-masterclass',
      title: 'Maximizing Your Deductions: Standard vs Itemized',
      description: 'Learn when to itemize deductions and how to maximize your tax savings legally.',
      category: 'deductions',
      difficulty: 'intermediate',
      estimatedTime: '45 minutes',
      rating: 4.9,
      enrolledCount: 12350,
      topics: ['Standard Deduction', 'Itemized Deductions', 'Mortgage Interest', 'State Taxes', 'Charitable Giving'],
      resources: {
        articles: ['Deduction Strategies', 'Bunching Deductions', 'Record Keeping'],
        videos: ['Standard vs Itemized Comparison', 'Deduction Optimization'],
        calculators: ['Itemized Deduction Calculator', 'Charity Deduction Tracker'],
        forms: ['Schedule A', 'Form 8283']
      }
    },
    {
      id: 'tax-credits-guide',
      title: 'Tax Credits That Can Save You Thousands',
      description: 'Discover valuable tax credits you might be missing, from Child Tax Credit to Education Credits.',
      category: 'credits',
      difficulty: 'intermediate',
      estimatedTime: '40 minutes',
      rating: 4.7,
      enrolledCount: 9870,
      topics: ['Child Tax Credit', 'Earned Income Credit', 'Education Credits', 'Energy Credits', 'Business Credits'],
      resources: {
        articles: ['Credit vs Deduction', 'Qualifying for Credits', 'Credit Phases-outs'],
        videos: ['Tax Credit Overview', 'Education Credit Details'],
        calculators: ['Child Tax Credit Calculator', 'EITC Calculator'],
        forms: ['Form 8862', 'Form 8863']
      }
    },
    {
      id: 'small-business-taxes',
      title: 'Small Business Tax Essentials',
      description: 'Everything you need to know about business taxes, from Schedule C to quarterly payments.',
      category: 'business',
      difficulty: 'advanced',
      estimatedTime: '60 minutes',
      rating: 4.6,
      enrolledCount: 7890,
      topics: ['Schedule C', 'Business Expenses', 'Self-Employment Tax', 'Quarterly Payments', 'QBI Deduction'],
      resources: {
        articles: ['Business Expense Guide', 'Home Office Deduction', 'Quarterly Payment Schedule'],
        videos: ['Schedule C Walkthrough', 'Business Tax Planning'],
        calculators: ['Self-Employment Tax Calculator', 'QBI Calculator'],
        forms: ['Schedule C', 'Schedule SE', 'Form 1099-NEC']
      }
    },
    {
      id: 'retirement-tax-planning',
      title: 'Retirement Tax Planning Strategies',
      description: 'Learn how to optimize your retirement savings for maximum tax benefits.',
      category: 'retirement',
      difficulty: 'intermediate',
      estimatedTime: '50 minutes',
      rating: 4.8,
      enrolledCount: 11230,
      topics: ['401(k) Contributions', 'IRA Types', 'Roth Conversions', 'RMDs', 'HSA Benefits'],
      resources: {
        articles: ['Traditional vs Roth IRA', '401(k) Optimization', 'HSA Triple Tax Advantage'],
        videos: ['Retirement Account Overview', 'Roth Conversion Strategy'],
        calculators: ['Retirement Savings Calculator', 'Roth Conversion Calculator'],
        forms: ['Form 5498', 'Form 1099-R']
      }
    },
    {
      id: 'state-tax-strategies',
      title: 'Multi-State Tax Planning',
      description: 'Navigate complex state tax situations, including residency and state tax optimization.',
      category: 'advanced',
      difficulty: 'advanced',
      estimatedTime: '55 minutes',
      rating: 4.5,
      enrolledCount: 5670,
      topics: ['Residency Rules', 'State Tax Planning', 'Multi-State Returns', 'SALT Limitations', 'State-Specific Credits'],
      resources: {
        articles: ['Residency Determination', 'State Tax Comparison', 'SALT Workarounds'],
        videos: ['Multi-State Tax Issues', 'Moving Between States'],
        calculators: ['State Tax Comparison', 'Residency Calculator'],
        forms: ['Various State Forms']
      }
    }
  ];

  const categories = [
    { key: 'all', label: 'All Courses', count: educationModules.length },
    { key: 'basics', label: 'Tax Basics', count: educationModules.filter(m => m.category === 'basics').length },
    { key: 'deductions', label: 'Deductions', count: educationModules.filter(m => m.category === 'deductions').length },
    { key: 'credits', label: 'Tax Credits', count: educationModules.filter(m => m.category === 'credits').length },
    { key: 'business', label: 'Business', count: educationModules.filter(m => m.category === 'business').length },
    { key: 'retirement', label: 'Retirement', count: educationModules.filter(m => m.category === 'retirement').length },
    { key: 'advanced', label: 'Advanced', count: educationModules.filter(m => m.category === 'advanced').length }
  ];

  const filteredModules = educationModules.filter(module => {
    const matchesCategory = activeCategory === 'all' || module.category === activeCategory;
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startQuiz = (module: EducationModule) => {
    if (module.quiz) {
      setSelectedModule(module);
      setShowQuiz(true);
      setCurrentQuizQuestion(0);
      setQuizAnswers([]);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizQuestion] = answerIndex;
    setQuizAnswers(newAnswers);

    if (selectedModule?.quiz && currentQuizQuestion < selectedModule.quiz.questions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    } else {
      // Quiz completed
      const correctAnswers = selectedModule?.quiz?.questions.filter((q, i) =>
        q.correctAnswer === newAnswers[i]
      ).length || 0;
      const totalQuestions = selectedModule?.quiz?.questions.length || 0;
      const score = Math.round((correctAnswers / totalQuestions) * 100);

      toast.success(`Quiz completed! Your score: ${score}% (${correctAnswers}/${totalQuestions})`, 5000);
      setShowQuiz(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Tax Education Center</h2>
        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
          {educationModules.length} Courses Available
        </span>
      </div>

      {!selectedModule ? (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search courses, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                    activeCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.label}
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{module.rating}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{module.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {module.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {module.enrolledCount.toLocaleString()}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {module.topics.slice(0, 3).map((topic, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                    {module.topics.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        +{module.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedModule(module)}
                    className="flex-1 bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Course
                  </button>
                  {module.quiz && (
                    <button
                      onClick={() => startQuiz(module)}
                      className="bg-green-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Award className="h-4 w-4" />
                      Quiz
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No courses found matching your criteria.</p>
            </div>
          )}
        </>
      ) : showQuiz && selectedModule.quiz ? (
        /* Quiz Interface */
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{selectedModule.title} - Quiz</h3>
              <span className="text-sm text-gray-600">
                Question {currentQuizQuestion + 1} of {selectedModule.quiz.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuizQuestion + 1) / selectedModule.quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-xl font-medium mb-6">
              {selectedModule.quiz.questions[currentQuizQuestion]?.question}
            </h4>
            <div className="space-y-3">
              {selectedModule.quiz.questions[currentQuizQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(index)}
                  className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setShowQuiz(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Exit Quiz
            </button>
          </div>
        </div>
      ) : (
        /* Course Detail View */
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setSelectedModule(null)}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Back to Courses
            </button>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedModule.title}</h2>
                <p className="text-gray-600 mb-4">{selectedModule.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-full ${getDifficultyColor(selectedModule.difficulty)}`}>
                    {selectedModule.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedModule.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {selectedModule.rating} rating
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedModule.enrolledCount.toLocaleString()} enrolled
                  </div>
                </div>
              </div>

              {selectedModule.quiz && (
                <button
                  onClick={() => startQuiz(selectedModule)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  Take Quiz
                </button>
              )}
            </div>
          </div>

          {/* Course Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Topics Covered</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedModule.topics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Course Content</h3>
                <p className="text-blue-800">
                  This comprehensive course covers all essential aspects of {selectedModule.title.toLowerCase()}.
                  You'll learn through interactive examples, real-world scenarios, and practical exercises.
                </p>
              </div>
            </div>

            {/* Resources Sidebar */}
            <div className="space-y-4">
              {selectedModule.resources && (
                <>
                  {selectedModule.resources.articles.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">📄 Articles</h4>
                      <ul className="space-y-1">
                        {selectedModule.resources.articles.map((article, index) => (
                          <li key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            {article}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedModule.resources.videos.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">🎥 Videos</h4>
                      <ul className="space-y-1">
                        {selectedModule.resources.videos.map((video, index) => (
                          <li key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {video}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedModule.resources.calculators.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">🧮 Calculators</h4>
                      <ul className="space-y-1">
                        {selectedModule.resources.calculators.map((calculator, index) => (
                          <li key={index} className="text-sm text-green-600 hover:text-green-800 cursor-pointer">
                            {calculator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedModule.resources.forms.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">📋 Forms</h4>
                      <ul className="space-y-1">
                        {selectedModule.resources.forms.map((form, index) => (
                          <li key={index} className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {form}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
