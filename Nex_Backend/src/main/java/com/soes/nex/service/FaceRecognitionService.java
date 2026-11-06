package com.soes.nex.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.soes.nex.model.FaceData;
import com.soes.nex.model.Student;
import com.soes.nex.repository.FaceDataRepository;
import com.soes.nex.repository.StudentRepository;

// 💡 ඔයාගේ OpenCV ක්ලාස් එක තියෙනවා නම් ඒක මෙතනින් Import කරගන්න
// import com.soes.nex.opencv.FaceDetectorLBPH; 

@Service
public class FaceRecognitionService {

    @Autowired
    private FaceDataRepository faceDataRepository;

    @Autowired
    private StudentRepository studentRepository;

    // 💡 OpenCV ක්ලාස් එක Autowire කරගන්න
    // @Autowired
    // private FaceDetectorLBPH faceDetector;

    // --- 1. අලුතින් මූණ සේව් කිරීම (Registration) ---
    public String registerFace(String username, String base64FaceData) {
        
        // අලුත් Architecture එකට අනුව Username එකෙන් ළමයාව හොයනවා
        Optional<Student> studentOpt = studentRepository.findByUserUsername(username);

        if (studentOpt.isEmpty()) {
            return "Error: Student not found!";
        }

        Student student = studentOpt.get();

        // අලුත් Face Data එකක් හදලා Database එකට සේව් කරනවා
        FaceData faceData = new FaceData();
        
        // ළමයාගේ ID එක සහ මූණේ ඩේටා ටික සෙට් කරනවා
        faceData.setStudentId(student.getStudentId()); 
        faceData.setFaceTemplate(base64FaceData); 
        
        faceDataRepository.save(faceData);

        // Student ගේ isFaceRegistered එක true කරලා අප්ඩේට් කරනවා
        student.setFaceRegistered(true);
        studentRepository.save(student);

        return "Face Registered Successfully!";
    }

    // --- 2. මූණ Verify කිරීම (Login / Exam Session) ---
    public boolean verifyFace(String username, String capturedBase64Image) {
        
        // 1. ළමයාව හොයනවා
        Optional<Student> studentOpt = studentRepository.findByUserUsername(username);
        
        if (studentOpt.isEmpty()) {
            return false;
        }

        Student student = studentOpt.get();
        
        // 2. ළමයාගේ සේව් කරලා තියෙන Face Data එක ගන්නවා
        Optional<FaceData> faceDataOpt = faceDataRepository.findByStudentId(student.getStudentId());

        if (faceDataOpt.isEmpty()) {
            return false; // කලින් මූණ සේව් කරලා නෑ
        }

        String savedTemplate = faceDataOpt.get().getFaceTemplate();

        /* * 🛡️ මෙතන තමයි ඔයාගේ OpenCV (LBPH) කෝඩ් එක වැඩ කරන්න ඕනේ!
         * ඔයාගේ FaceDetectorLBPH ක්ලාස් එකට මේ Base64 පින්තූර දෙක යවලා මැච් වෙනවද බලන්න.
         */
        
        // උදාහරණයක් විදිහට කෝඩ් එක එන්න ඕනේ මෙහෙමයි:
        // boolean isMatch = faceDetector.compareImages(savedTemplate, capturedBase64Image);
        
        // 💡 දැනට ටෙස්ට් කරන්න නිකන්ම True යවනවා (OpenCV කෝඩ් එක දානකම්). 
        // OpenCV කෝඩ් එක දැම්මට පස්සේ මේ පේළිය මකලා දාන්න.
        boolean isMatch = true; 

        return isMatch;
    }
}