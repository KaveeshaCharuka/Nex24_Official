package com.soes.nex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.QuestionOption;
import java.util.List; // 💡 List import කිරීම

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Integer> { 
    List<QuestionOption> findByQuestionId(Integer questionId); // 💡 අඩුවෙලා තිබ්බ Method එක
}