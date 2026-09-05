from app.services.llm import generate_answer


context = """
This is to certify that Amireddy Rakesh Reddy has successfully
completed a Short-Term Virtual Internship Program of 2 months
(120 hours) on Full Stack Developer MERN Stack organized by
SmartBridge Educational Services Pvt. Ltd. in collaboration
with Andhra Pradesh State Council of Higher Education.
"""


question = "What is this certificate about?"

answer = generate_answer(question, context)

print("\nANSWER:")
print(answer)