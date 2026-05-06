import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import AppHeader from '@/src/components/AppHeader';
import ResultTableCard from '@/src/components/ResultTableCard';
import { COLORS } from '@/src/config/constants';
import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { EvaluationResult } from '../../domain/entities/Evaluation';
import { useCourses } from '../context/courseContext';
import type { RootStackParamList } from '@/src/AuthFlow';

type RoutePropType = RouteProp<RootStackParamList, 'Results'>;

type SummaryRow = {
  label: string;
  score: string | number;
};

type ResultCard = {
  name: string;
  average: string;
  criteria: SummaryRow[];
};

function buildCard(
  name: string,
  scoresByCriterion: Record<string, number[]>,
): ResultCard {
  const criteriaList = Object.entries(scoresByCriterion).map(
    ([criterion, scores]) => {
      const avg =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      return { label: criterion, score: avg.toFixed(1) };
    },
  );

  const allScores = Object.values(scoresByCriterion).flat();
  const totalAvg =
    allScores.length > 0
      ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
      : '0.0';

  return { name, average: totalAvg, criteria: criteriaList };
}

export default function ResultsScreen() {
  const route = useRoute<RoutePropType>();
  const { activity } = route.params;
  const { getEvaluationResults } = useCourses();
  const prefs = LocalPreferencesAsyncStorage.getInstance();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [cards, setCards]     = useState<ResultCard[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    try {
      setLoading(true);
      setError('');

      const userId = await prefs.retrieveData<string>('userId');
      if (!userId) throw new Error('Usuario no encontrado');

      const raw: EvaluationResult[] = await getEvaluationResults(
        activity._id,
        userId,
      );


      if (!raw.length) {
        setHasData(false);
        return;
      }


      const globalByCriterion: Record<string, number[]> = {};
      for (const r of raw) {
        for (const [criterion, scores] of Object.entries(r.scoresByCriterion)) {
          if (!globalByCriterion[criterion]) globalByCriterion[criterion] = [];
          globalByCriterion[criterion].push(...scores);
        }
      }

      const myCard = buildCard('Tu resultado', globalByCriterion);


      const publicCards: ResultCard[] = activity.is_public
        ? raw
            .filter(r => Object.keys(r.scoresByCriterion).length > 0)
            .map(r => buildCard(r.evaluatorName, r.scoresByCriterion))
        : [];


      if (myCard.criteria.length === 0 && publicCards.length === 0) {
        setHasData(false);
        return;
      }

      setHasData(true);
      setCards([myCard, ...publicCards]);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar resultados');
    } finally {
      setLoading(false);
    }
  }


  const noResults = !loading && !error && !hasData;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Resultados" />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : noResults ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              Aún no hay resultados disponibles
            </Text>
          </View>
        ) : (
          <FlatList
            data={cards}
            keyExtractor={(_, index) => `result-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ResultTableCard
                name={item.name}
                average={item.average}
                criteria={item.criteria}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
  },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText:   { color: '#e74c3c', fontSize: 14, textAlign: 'center' },
  emptyText:   { color: '#7A7090', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  listContent: { paddingBottom: 20 },
});