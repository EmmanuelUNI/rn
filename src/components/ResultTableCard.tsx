import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../config/constants';

interface CriterionRow {
  label: string;
  score: string | number;
}

interface ResultTableCardProps {
  name: string;
  average: string | number;
  highlighted?: boolean;
  criteria: CriterionRow[];
}

export default function ResultTableCard({
  name,
  average,
  highlighted = false,
  criteria,
}: ResultTableCardProps) {
  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted]}>
      <View style={styles.header}>
        <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
        <Text style={styles.headerAvg}>{average}</Text>
      </View>
      {criteria.map((row, index) => (
        <View
          key={row.label}
          style={[styles.row, index === criteria.length - 1 && styles.rowLast]}>
          <View style={styles.labelCol}>
            <Text style={styles.labelText}>{row.label}</Text>
          </View>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreText}>{row.score}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 18,
  },
  cardHighlighted: { borderColor: '#2196F3', borderWidth: 2 },
  header: {
    backgroundColor: COLORS.accentLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerName: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  headerAvg:  { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowLast: { borderBottomWidth: 0 },
  labelCol: {
    flex: 2,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
    justifyContent: 'center',
  },
  labelText: { color: COLORS.textLight, fontSize: 11 },
  scoreCol:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  scoreText: { color: COLORS.primary, fontSize: 11 },
});